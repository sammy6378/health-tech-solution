import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
} from 'class-validator';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}
export class CreateUserProfileDto {
  @IsUUID()
  user_id: string;

  @IsPhoneNumber()
  phone_number: string;

  @IsString()
  address: string;

  @IsEnum(Gender)
  @IsOptional()
  sex?: Gender;

  @IsDate()
  @IsOptional()
  date_of_birth: Date;

  @IsNumber()
  age: number;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  postal_code?: string;

  @IsString()
  @IsOptional()
  avatar?: string;
}
