import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export enum Role {
  ADMIN = 'admin',
  USER = 'user',
  DOCTOR = 'doctor',
  PHARMACY = 'pharmacy',
}
export class CreateUserDto {
  @IsString()
  user_id: string;

  @ApiProperty({
    description: 'The first name of the user',
    example: 'John',
    required: true,
    type: String,
  })
  @IsString()
  first_name: string;

  @ApiProperty({
    description: 'The last name of the user',
    example: 'Doe',
    required: true,
    type: String,
  })
  @IsString()
  last_name: string;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'johndoe@gmail.com',
    required: true,
    type: String,
    uniqueItems: true,
    format: 'email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The password for the user account',
    example: 'StrongPassword123!',
    required: true,
    type: String,
  })
  @IsStrongPassword()
  password: string;

  @ApiProperty({
    description: 'The role of the user',
    example: 'user',
    required: false,
    enum: Role,
    default: Role.USER,
  })
  @IsEnum(Role)
  role: Role = Role.USER;

  @IsOptional()
  @IsString()
  refresh_token?: string;
}
