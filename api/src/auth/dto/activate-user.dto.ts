import { IsString } from 'class-validator';

export class ActivateUserDto {
  @IsString()
  activation_token: string;

  @IsString()
  activation_code: string;
}
