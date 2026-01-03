import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';

interface VerificationJobData {
  userId: string;
  email: string;
}

@Processor('email-verification', {
  concurrency: 5,
  limiter: {
    max: 10,
    duration: 1000, // 10 jobs per second
  },
})
export class VerificationProcessor extends WorkerHost {
  private readonly logger = new Logger(VerificationProcessor.name);
  private readonly otpExpiryHours: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {
    super();
    this.otpExpiryHours =
      this.configService.get<number>('VERIFICATION_OTP_EXPIRY_HOURS') || 24;
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async process(job: Job<VerificationJobData>): Promise<void> {
    const { userId, email } = job.data;

    this.logger.log(
      `Processing verification email job for user ${userId} (Job ID: ${job.id})`,
    );

    try {
      // Invalidate all previous OTPs for this user
      await this.prisma.verificationOtp.updateMany({
        where: {
          userId,
          usedAt: null,
        },
        data: {
          usedAt: new Date(),
        },
      });

      // Generate unique OTP
      let otp: string = this.generateOtp();
      let exists = true;

      while (exists) {
        const existing = await this.prisma.verificationOtp.findFirst({
          where: {
            otp,
            usedAt: null,
            expiresAt: {
              gte: new Date(),
            },
          },
        });
        exists = !!existing;
        if (exists) {
          otp = this.generateOtp();
        }
      }

      // Calculate expiry time
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + this.otpExpiryHours);

      // Store OTP in database
      await this.prisma.verificationOtp.create({
        data: {
          otp,
          userId,
          expiresAt,
        },
      });

      this.logger.log(`Created OTP for user ${userId}`);

      // Send verification email
      await this.emailService.sendVerificationEmail(email, otp);

      this.logger.log(
        `Successfully sent verification email to ${email} (Job ID: ${job.id})`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to process verification email for ${email} (Job ID: ${job.id})`,
        error.stack,
      );
      // Re-throw to trigger BullMQ retry mechanism
      throw error;
    }
  }
}
