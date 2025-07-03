import { IsDate, IsDecimal, IsEnum, IsNumber, IsUUID } from 'class-validator';
import { PaymentMethod, PaymentStatus } from 'src/orders/dto/create-order.dto';

export class CreatePaymentDto {
  @IsUUID()
  order_number: string;

  @IsDecimal({ decimal_digits: '0,2' })
  @IsNumber()
  amount: number;

  @IsDate()
  payment_date: Date;

  @IsEnum(PaymentStatus)
  payment_status: PaymentStatus;

  @IsEnum(PaymentMethod)
  payment_method: PaymentMethod;
}
