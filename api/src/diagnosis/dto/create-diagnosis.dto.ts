import { IsArray, IsDate, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateDiagnosisDto {
  @IsUUID()
  patient_id: string;

  @IsUUID()
  doctor_id: string;

  @IsUUID()
  prescription_id: string;

  @IsString()
  diagnosis: string;

  @IsString()
  treatment_plan: string;

  @IsDate()
  record_date: Date;

  @IsString()
  @IsOptional()
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
}
