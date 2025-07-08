import {
  IsArray,
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateDiagnosisDto {
  @IsString()
  diagnosis_name: string;

  @IsString()
  treatment_plan: string;

  @IsDateString()
  diagnosis_date: string;

  @IsOptional()
  @IsArray()
  notes?: string[];

  @IsOptional()
  @IsArray()
  docs?: string[];

  @IsOptional()
  @IsArray()
  tests?: string[];

  @IsOptional()
  @IsArray()
  allergies?: string[];

  @IsOptional()
  @IsArray()
  symptoms?: string[];

  @IsUUID()
  patient_id: string;

  @IsUUID()
  doctor_id: string;

  @IsOptional()
  @IsUUID()
  prescription_id?: string; // Optional, prescriptions can come later

  @IsOptional()
  @IsUUID()
  appointment_id?: string;
}
