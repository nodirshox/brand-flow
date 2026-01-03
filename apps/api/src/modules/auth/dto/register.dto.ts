import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsNotEmpty, MinLength } from "class-validator";
import { UserRole } from "@prisma/client";

export class RegisterDto {
  @ApiProperty({
    example: "user@example.com",
    description: "User email address",
  })
  @IsEmail({}, { message: "Invalid email format" })
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: "SecurePass123!",
    description: "User password must be at least 6 characters)",
  })
  @IsNotEmpty()
  @MinLength(6, { message: "Password must be at least 6 characters long" })
  password: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.BUSINESS,
    description: "User role",
  })
  @IsEnum(UserRole, { message: "Role must be either BUSINESS or CREATOR" })
  @IsNotEmpty()
  role: UserRole;
}
