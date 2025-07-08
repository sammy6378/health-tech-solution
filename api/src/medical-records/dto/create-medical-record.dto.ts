import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  IsDecimal,
  IsArray,
  IsDateString,
  Min,
  Max,
  IsPositive,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateMedicalRecordDto {
  @IsOptional()
  @IsDateString()
  record_date?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  diagnosis?: string;

  @IsOptional()
  @IsString()
  treatment_plan?: string;

  @IsOptional()
  @IsString()
  blood_pressure?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  heart_rate?: number;

  @IsOptional()
  @IsDecimal({ decimal_digits: '0,2' })
  @Min(0)
  @Max(50)
  @Transform(({ value }: { value: string }) => parseFloat(value))
  temperature?: number;

  @IsOptional()
  @IsDecimal({ decimal_digits: '0,2' })
  @Min(0)
  @Max(500)
  @Transform(({ value }: { value: string }) => parseFloat(value))
  weight?: number;

  @IsOptional()
  @IsDecimal({ decimal_digits: '0,2' })
  @Min(0)
  @Max(300)
  @Transform(({ value }: { value: string }) => parseFloat(value))
  height?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  docs?: string[];

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  patient_id: string;
}
