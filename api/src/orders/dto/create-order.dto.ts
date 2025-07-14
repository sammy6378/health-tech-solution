import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { CreateOrderMedicationDto } from './order-medication.dto';
import { Type } from 'class-transformer';

export enum DeliveryMethod {
  HOME_DELIVERY = 'home_delivery',
  PICKUP = 'pickup',
}

export enum DeliveryStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  MOBILE_MONEY = 'mobile_money',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export class CreateOrderDto {
  @IsString()
  order_number: string;

  @IsNumber()
  total_amount?: number;

  @IsString()
  delivery_address: string;

  @IsEnum(DeliveryMethod)
  delivery_method: DeliveryMethod;

  @IsOptional()
  @IsString()
  delivery_time: string;

  @IsEnum(PaymentMethod)
  payment_method: PaymentMethod;

  @IsEnum(PaymentStatus)
  payment_status: PaymentStatus = PaymentStatus.PENDING;

  @IsEnum(DeliveryStatus)
  delivery_status: DeliveryStatus = DeliveryStatus.PENDING;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsUUID()
  @IsNotEmpty()
  patient_id: string;

  @IsArray()
  @IsNotEmpty()
  @Type(() => CreateOrderMedicationDto)
  medications: CreateOrderMedicationDto[];
}
