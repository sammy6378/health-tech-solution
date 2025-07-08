import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export enum AppointmentStatus {
  PENDING = 'pending',
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum ConsultationType {
  IN_PERSON = 'in-person',
  VIRTUAL = 'virtual',
}

export class CreateAppointmentDto {
  @IsDate()
  appointment_date: Date;

  @IsString()
  appointment_time: string;

  @IsNumber()
  duration_minutes: number;

  @IsEnum(ConsultationType)
  consultation_type: ConsultationType;

  @IsEnum(AppointmentStatus)
  status: AppointmentStatus = AppointmentStatus.SCHEDULED;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsUUID()
  patient_id: string;

  @IsUUID()
  doctor_id: string;
}
