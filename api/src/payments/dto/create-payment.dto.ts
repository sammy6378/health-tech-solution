import { IsDate, IsDecimal, IsEnum, IsNumber, IsString } from 'class-validator';
import { PaymentMethod, PaymentStatus } from 'src/orders/dto/create-order.dto';
import { PrimaryGeneratedColumn } from 'typeorm';

export class CreatePaymentDto {
  @PrimaryGeneratedColumn('uuid')
  payment_id: string;

  @IsString()
  order_number: string;

  @IsDecimal({ decimal_digits: '0,2' })
  @IsNumber()
  amount: number;

  @IsString()
  transcation_id: string;

  @IsDate()
  payment_date: Date;

  @IsEnum(PaymentStatus)
  payment_status: PaymentStatus;

  @IsEnum(PaymentMethod)
  payment_method: PaymentMethod;

  @IsString()
  patient_id: string;
}
