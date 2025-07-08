import { PaymentMethod, PaymentStatus } from 'src/orders/dto/create-order.dto';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('payments')
export class Payment {
  // Primary key for the payment
  @PrimaryGeneratedColumn('uuid')
  payment_id: string;

  // Amount paid
  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  payment_status: PaymentStatus;

  @Column({ type: 'enum', enum: PaymentMethod })
  payment_method: PaymentMethod;

  @Column({ unique: true })
  transcation_id: string;

  @Column({ type: 'date' })
  payment_date: Date;

  @Column()
  order_number: string;

  @Column({ type: 'uuid' })
  order_id: string;

  @Column({ type: 'uuid' })
  patient_id: string;
}
