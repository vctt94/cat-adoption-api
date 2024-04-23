// src/auth/dto/login.dto.ts
import { IsNotEmpty, IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  // Docs
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address of the user',
    format: 'email'
  })
  // End Docs
  @IsEmail({}, { message: "Invalid email format" })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  // Docs
  @ApiProperty({
    example: 'yourpassword',
    description: 'Password for the user account',
    type: 'string'
  })
  // End Docs
  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  password: string;
}
