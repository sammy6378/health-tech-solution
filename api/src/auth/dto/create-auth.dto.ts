import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAuthDto {
  @ApiProperty({
    description: 'Email address of the user',
    required: true,
    example: 'johndoe@gmail.com',
  })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({
    description: 'Password for the user',
    required: true,
    example: 'StrongP@ssw0rd!',
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}
