import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class MedicationItemDto {
  @IsUUID()
  medication_id: string;

  @IsUUID()
  prescription_id: string;

  @IsNumber()
  @Min(1)
  quantity_prescribed: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  frequency_per_day?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  duration_days?: number;

  @IsString()
  @IsOptional()
  medication_name: string;

  @IsArray()
  @IsString({ each: true })
  dosage_instructions: string[];
}
