import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';
import { VerificationService } from './verification.service';
import { VerificationController } from './verification.controller';
import { VerificationProcessor } from './verification.processor';
import { PrismaModule } from '../../prisma/prisma.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'email-verification',
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000, // Start with 1 second, then 2s, 4s
        },
        removeOnComplete: {
          age: 24 * 3600, // Keep completed jobs for 24 hours
          count: 1000, // Keep last 1000 completed jobs
        },
        removeOnFail: {
          age: 7 * 24 * 3600, // Keep failed jobs for 7 days
        },
      },
    }),
    ConfigModule,
    PrismaModule,
    EmailModule,
  ],
  controllers: [VerificationController],
  providers: [VerificationService, VerificationProcessor],
  exports: [BullModule, VerificationService],
})
export class VerificationModule {}
