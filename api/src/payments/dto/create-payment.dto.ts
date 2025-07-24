import {
  IsDate,
  IsDecimal,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { PaymentMethod, PaymentStatus } from 'src/orders/dto/create-order.dto';
import { PrimaryGeneratedColumn } from 'typeorm';

export enum PaymentType {
  MEDICATIONS = 'medications',
  APPOINTMENTS = 'appointments',
  LAB_TESTS = 'lab_tests',
  CONSULTATIONS = 'consultations',
}

export class CreatePaymentDto {
  @PrimaryGeneratedColumn('uuid')
  payment_id: string;

  @IsString()
  @IsOptional()
  order_number?: string;

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

  @IsEnum(PaymentType)
  @IsOptional()
  payment_type: PaymentType = PaymentType.MEDICATIONS;

  @IsUUID()
  user_id: string;

  @IsUUID()
  @IsOptional()
  doctor_id?: string;

  @IsUUID()
  @IsOptional()
  appointment_id?: string;
}
