import { IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty({
    description: '6-digit verification code',
    example: '123456',
    pattern: '^[0-9]{6}$',
  })
  @IsString()
  @Matches(/^[0-9]{6}$/, {
    message: 'Token must be a 6-digit number',
  })
  token: string;
}
