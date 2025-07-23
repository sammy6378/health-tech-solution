import {
  IsArray,
  IsBoolean,
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
  @IsString()
  appointment_date: string;

  @IsString()
  start_time: string;

  @IsString()
  @IsOptional()
  end_time: string;

  @IsNumber()
  @IsOptional()
  duration_minutes?: number;

  @IsString()
  reason: string;

  @IsArray({ each: true })
  time_slots?: string[];

  @IsOptional()
  @IsBoolean()
  needs_meeting_link?: boolean;

  @IsString()
  @IsOptional()
  meeting_link?: string;

  @IsString()
  @IsOptional()
  zoom_meeting_id?: string;

  @IsString()
  start_url: string;

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
