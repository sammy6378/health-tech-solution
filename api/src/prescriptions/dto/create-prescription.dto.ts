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
  PENDING = 'pending',
  FILLED = 'filled',
  CANCELLED = 'cancelled',
  PARTIAL = 'partial',
}

export class CreatePrescriptionDto {
  @IsUUID()
  patient_id: string;

  @IsUUID()
  doctor_id: string;

  @IsUUID()
  medication_id: string;

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
