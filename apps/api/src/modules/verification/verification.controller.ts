import { Controller, Post, Body } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { VerificationService } from "./verification.service";
import { ResendVerificationDto } from "./dto/resend-verification.dto";

@ApiTags("Verification")
@Controller("auth")
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Post("verify-email")
  @ApiOperation({ summary: "Verify email with OTP token" })
  @ApiResponse({
    status: 200,
    description: "Email verified successfully",
  })
  @ApiResponse({
    status: 400,
    description: "Invalid or expired token",
  })
  async verifyEmail(
    @Body("token") token: string
  ): Promise<{ message: string; verified: boolean }> {
    if (!token || !/^[0-9]{6}$/.test(token)) {
      throw new Error("Invalid verification token format");
    }

    await this.verificationService.verifyEmail(token);

    return {
      message: "Email verified successfully",
      verified: true,
    };
  }

  @Post("resend-verification")
  @ApiOperation({ summary: "Resend verification email" })
  @ApiResponse({
    status: 200,
    description: "Verification email sent successfully",
  })
  @ApiResponse({
    status: 400,
    description: "Bad request (already verified or rate limit exceeded)",
  })
  @ApiResponse({
    status: 404,
    description: "User not found",
  })
  async resendVerification(
    @Body() resendVerificationDto: ResendVerificationDto
  ): Promise<{ message: string; expiresIn: string }> {
    await this.verificationService.resendVerification(
      resendVerificationDto.email
    );

    return {
      message: "Verification email sent successfully",
      expiresIn: "24 hours",
    };
  }
}
