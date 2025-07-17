import { Type } from 'class-transformer';
import {
  IsDateString,
  IsDecimal,
  IsEnum,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { MedicationItemDto } from './MedicationItem.dto';

export enum PrescriptionStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  FILLED = 'filled',
  CANCELLED = 'cancelled',
  PARTIAL = 'partial',
}

export class CreatePrescriptionDto {
  @ValidateNested({ each: true })
  @Type(() => MedicationItemDto)
  items: MedicationItemDto[];

  @IsUUID()
  diagnosis_id: string;

  @IsDateString()
  prescription_date: string;

  @IsDecimal({ decimal_digits: '2' })
  total_price?: number;

  @IsString()
  prescription_number: string;

  @IsEnum(PrescriptionStatus)
  status: PrescriptionStatus = PrescriptionStatus.PENDING;
}
