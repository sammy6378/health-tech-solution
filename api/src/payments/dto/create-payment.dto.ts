import {
  IsDate,
  IsDecimal,
  IsEnum,
  IsNumber,
  IsString,
  IsUUID,
} from 'class-validator';
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
  full_name: string;

  @IsString()
  email: string;

  @IsString()
  phone_number: string;

  @IsString()
  paystack_checkout_url: string;

  @IsString()
  paystack_reference: string;

  @IsString()
  paystack_access_code: string;

  @IsDate()
  payment_date: Date;

  @IsEnum(PaymentStatus)
  payment_status: PaymentStatus;

  @IsEnum(PaymentMethod)
  payment_method: PaymentMethod;

  @IsUUID()
  user_id: string;
}
