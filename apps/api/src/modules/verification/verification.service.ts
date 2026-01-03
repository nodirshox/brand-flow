import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import Redis from 'ioredis';

@Injectable()
export class VerificationService {
  private readonly logger = new Logger(VerificationService.name);
  private readonly redis: Redis;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    @InjectQueue('email-verification') private readonly verificationQueue: Queue,
  ) {
    // Initialize Redis client for rate limiting
    this.redis = new Redis({
      host: this.configService.get<string>('REDIS_HOST'),
      port: this.configService.get<number>('REDIS_PORT'),
      password: this.configService.get<string>('REDIS_PASSWORD') || undefined,
    });
  }

  async queueVerificationEmail(userId: string, email: string): Promise<void> {
    try {
      // Add email job to queue (processor will handle OTP generation)
      await this.verificationQueue.add('send-verification-email', {
        userId,
        email,
      });

      this.logger.log(`Queued verification email for user ${userId}`);
    } catch (error) {
      this.logger.error(
        `Error queuing verification email for user ${userId}`,
        error.stack,
      );
      throw error;
    }
  }

  async verifyEmail(token: string): Promise<{ userId: string }> {
    try {
      this.logger.log(`Verification attempt with token: ${token.substring(0, 2)}****`);

      // Use transaction to ensure atomicity
      const result = await this.prisma.$transaction(async (tx) => {
        // Find valid OTP
        const otpRecord = await tx.verificationOtp.findFirst({
          where: {
            otp: token,
            usedAt: null,
            expiresAt: {
              gte: new Date(),
            },
          },
          include: {
            user: true,
          },
        });

        if (!otpRecord) {
          throw new BadRequestException(
            'Invalid or expired verification token',
          );
        }

        // Mark OTP as used
        await tx.verificationOtp.update({
          where: {
            id: otpRecord.id,
          },
          data: {
            usedAt: new Date(),
          },
        });

        // Update user verification status
        await tx.user.update({
          where: {
            id: otpRecord.userId,
          },
          data: {
            isVerified: true,
          },
        });

        return { userId: otpRecord.userId };
      });

      this.logger.log(`User ${result.userId} successfully verified`);
      return result;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Error verifying email', error.stack);
      throw new BadRequestException('Verification failed');
    }
  }

  async resendVerification(email: string): Promise<void> {
    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Check rate limit (max 3 resends per hour)
    await this.checkResendRateLimit(user.id);

    // Queue verification email (processor will handle OTP generation)
    await this.queueVerificationEmail(user.id, user.email);

    this.logger.log(`Resent verification email to ${email}`);
  }

  private async checkResendRateLimit(userId: string): Promise<void> {
    const key = `verification:resend:${userId}`;
    const count = await this.redis.get(key);

    if (count && parseInt(count) >= 3) {
      throw new BadRequestException(
        'Too many resend requests. Please try again later.',
      );
    }

    // Increment counter with 1 hour TTL
    const multi = this.redis.multi();
    multi.incr(key);
    multi.expire(key, 3600); // 1 hour
    await multi.exec();
  }

  async cleanupExpiredOtps(): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await this.prisma.verificationOtp.deleteMany({
      where: {
        OR: [
          {
            expiresAt: {
              lt: new Date(),
            },
          },
          {
            usedAt: {
              not: null,
            },
            createdAt: {
              lt: thirtyDaysAgo,
            },
          },
        ],
      },
    });

    this.logger.log(`Cleaned up ${result.count} expired OTPs`);
    return result.count;
  }
}
