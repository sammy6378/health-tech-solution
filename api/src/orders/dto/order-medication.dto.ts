import { IsNumber, IsUUID } from 'class-validator';

export class CreateOrderMedicationDto {
  @IsNumber()
  quantity: number;
  @IsNumber()
  unit_price: number;
  @IsNumber()
  total_amount: number;

  @IsUUID()
  order_id: string;
  @IsUUID()
  medication_id: string;
}
