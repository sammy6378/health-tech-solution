import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Gender } from 'src/user-profile/dto/create-user-profile.dto';

export class CreateDoctorProfileDto {
  @IsArray()
  days: string[];

  @IsString()
  start_time: string;

  @IsString()
  end_time: string;

  @IsString()
  specialization: string;

  @IsString()
  license_number: string;

  @IsNumber()
  years_of_experience: number;

  @IsString()
  education: string;

  @IsString()
  department: string;

  @IsBoolean()
  availability: boolean;

  @IsString()
  phone_number: string;

  @IsEnum(Gender)
  sex: Gender;

  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsNumber()
  consultation_fee?: number;

  @IsOptional()
  @IsArray()
  ratings?: number[];

  @IsOptional()
  @IsArray()
  reviews?: string[];

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsUUID()
  user_id: string;
}
