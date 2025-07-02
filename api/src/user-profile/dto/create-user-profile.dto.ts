import {
  IsDate,
  IsEnum,
  IsNumber,
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
  sex: Gender;

  @IsDate()
  date_of_birth: Date;

  @IsNumber()
  age: number;

  @IsString()
  city?: string;

  @IsString()
  state?: string;

  @IsString()
  country?: string;

  @IsString()
  postal_code?: string;

  @IsString()
  avatar?: string;
}
