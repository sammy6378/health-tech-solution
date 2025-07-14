import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  IsArray,
  IsDateString,
  Min,
  Max,
  IsPositive,
  IsNumber,
} from 'class-validator';

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
  @IsNumber()
  @Min(0)
  @Max(300)
  temperature?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(300)
  height?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(500)
  weight?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  BMI: number;

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
