// filepath: d:\tech-health-solution\api\src\orders\dto\create-order.dto.ts
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

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
  @IsUUID()
  prescription_id: string;

  @IsString()
  delivery_address: string;

  @IsEnum(DeliveryMethod)
  delivery_method: DeliveryMethod;

  @IsString()
  delivery_time: string;

  @IsEnum(PaymentMethod)
  payment_method: PaymentMethod;

  @IsEnum(DeliveryStatus)
  delivery_status: DeliveryStatus = DeliveryStatus.PENDING;

  @IsOptional()
  @IsString()
  notes?: string;
}
