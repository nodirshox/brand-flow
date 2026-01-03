export interface VerificationEmailData {
  subject: string;
  html: string;
  text: string;
}

export function buildVerificationEmail(
  otp: string,
  frontendUrl: string,
): VerificationEmailData {
  const verificationUrl = `${frontendUrl}/verify-email?token=${otp}`;

  const subject = 'Verify Your Email - Brand Flow';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center;">
              <h1 style="margin: 0; color: #333333; font-size: 28px; font-weight: bold;">Brand Flow</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 20px 40px;">
              <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px; font-weight: normal;">Verify Your Email Address</h2>
              <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.5;">
                Welcome to Brand Flow! To complete your registration and start using our platform, please verify your email address by clicking the button below.
              </p>
              <p style="margin: 0 0 30px 0; color: #666666; font-size: 16px; line-height: 1.5;">
                Your verification code is: <strong style="color: #333333; font-size: 20px; letter-spacing: 2px;">${otp}</strong>
              </p>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 0 0 30px 0;">
                    <a href="${verificationUrl}" style="display: inline-block; padding: 16px 40px; background-color: #4F46E5; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold;">Verify Email Address</a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px; line-height: 1.5;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin: 0 0 20px 0; color: #4F46E5; font-size: 14px; word-break: break-all;">
                ${verificationUrl}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px 40px 40px; border-top: 1px solid #eeeeee;">
              <p style="margin: 0 0 10px 0; color: #999999; font-size: 12px; line-height: 1.5;">
                <strong>This verification link will expire in 24 hours.</strong>
              </p>
              <p style="margin: 0; color: #999999; font-size: 12px; line-height: 1.5;">
                If you didn't create an account with Brand Flow, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `
Brand Flow - Verify Your Email Address

Welcome to Brand Flow!

To complete your registration and start using our platform, please verify your email address.

Your verification code is: ${otp}

Click the link below to verify your email:
${verificationUrl}

This verification link will expire in 24 hours.

If you didn't create an account with Brand Flow, you can safely ignore this email.
  `.trim();

  return {
    subject,
    html,
    text,
  };
}
