import { PaymentMethod, PaymentStatus } from 'src/orders/dto/create-order.dto';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PaymentType } from '../dto/create-payment.dto';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  payment_id: string;

  // Amount paid
  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  payment_status: PaymentStatus;

  @Column({ type: 'enum', enum: PaymentMethod })
  payment_method: PaymentMethod;

  @Column({ type: 'enum', enum: PaymentType, default: PaymentType.MEDICATIONS })
  payment_type: PaymentType;

  @Column()
  full_name: string;

  @Column()
  email: string;

  @Column()
  phone_number: string;

  @Column()
  paystack_checkout_url: string;

  @Column()
  paystack_reference: string;

  @Column()
  paystack_access_code: string;

  @Column({ type: 'date' })
  payment_date: Date;

  @Column({ nullable: true })
  order_number: string;

  @Column({ nullable: true })
  appointment_id?: string;

  @ManyToOne(() => User, (user) => user.payments)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'doctor_id' })
  doctor: User;
}
