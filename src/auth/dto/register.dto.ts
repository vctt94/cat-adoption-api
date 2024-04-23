// src/auth/dto/register.dto.ts
import { Role } from "@/common/entities/role.entity";
import { IsNotEmpty, IsString, MinLength, IsEmail, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  // Doc
  @ApiProperty({ example: 'John Doe', description: 'Full name of the user' })
  // End Doc
  @IsString()
  @IsNotEmpty({ message: "Name is required" })
  name: string;

  // Doc
  @ApiProperty({ example: 'john.doe@example.com', description: 'Email address of the user' })
  // End Doc
  @IsEmail({}, { message: "Invalid email" })
  @IsNotEmpty({ message: "Email is required" })
  email: string;

  // Doc
  @ApiProperty({ example: 'password123!', description: 'Password for the user account', minLength: 8 })
  // End Doc
  @IsString()
  @IsNotEmpty({ message: "Password is required" })
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  password: string;

  // Doc
  @ApiProperty({ enum: Role, description: 'Role of the user in the system' })
  // End Doc
  @IsEnum(Role, { message: "Invalid role" })
  role: Role;
}
