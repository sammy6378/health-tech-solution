import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePharmacyDto {
  @IsString()
  @IsNotEmpty()
  business_name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  phone_number: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  license_number: string;

  @IsString()
  @IsOptional()
  city: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  zip_code?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  website?: string;

  @IsString()
  @IsOptional()
  opening_hours?: string;

  @IsString()
  @IsOptional()
  closing_hours?: string;

  @IsString()
  user_id: string;
}
