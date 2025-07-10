import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export enum PrescriptionStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  FILLED = 'filled',
  CANCELLED = 'cancelled',
  PARTIAL = 'partial',
}

export class CreatePrescriptionDto {
  @IsArray()
  @IsUUID(4, { each: true })
  medication_ids: string[];

  @IsUUID()
  diagnosis_id: string;

  @IsDateString()
  prescription_date: string;

  @IsString()
  prescription_number: string;

  @IsNumber()
  @Min(1)
  quantity_prescribed: number;

  @IsArray()
  @IsString({ each: true })
  dosage_instructions: string[];

  @IsEnum(PrescriptionStatus)
  status: PrescriptionStatus = PrescriptionStatus.PENDING;

  @IsOptional()
  @IsNumber()
  @Min(1)
  duration_days?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  frequency_per_day?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
