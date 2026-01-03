import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { buildVerificationEmail } from './templates/verification-email.template';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend;
  private readonly emailFrom: string;
  private readonly frontendUrl: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    this.resend = new Resend(apiKey);
    this.emailFrom = this.configService.get<string>('EMAIL_FROM') || '';
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL') || '';
  }

  async sendVerificationEmail(email: string, otp: string): Promise<void> {
    try {
      const { subject, html, text } = buildVerificationEmail(
        otp,
        this.frontendUrl,
      );

      this.logger.log(`Sending verification email to ${email}`);

      const result = await this.resend.emails.send({
        from: this.emailFrom,
        to: email,
        subject,
        html,
        text,
      });

      if (result.error) {
        this.logger.error(
          `Failed to send verification email to ${email}`,
          result.error,
        );
        throw new Error(`Email sending failed: ${result.error.message}`);
      }

      this.logger.log(
        `Verification email sent successfully to ${email} with ID: ${result.data?.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Error sending verification email to ${email}`,
        error.stack,
      );
      throw error;
    }
  }
}
