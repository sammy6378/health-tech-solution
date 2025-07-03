import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import {
  DeliveryMethod,
  DeliveryStatus,
  PaymentMethod,
} from '../dto/create-order.dto';
import { User } from 'src/users/entities/user.entity';
import { Prescription } from 'src/prescriptions/entities/prescription.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  order_id: string;

  @Column({ unique: true })
  order_number: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  order_date: Date;

  @Column()
  delivery_address: string;

  @Column({ type: 'enum', enum: DeliveryMethod })
  delivery_method: DeliveryMethod;

  @Column({ nullable: true })
  delivery_time: string;

  @Column()
  estimated_delivery: string;

  @Column({
    type: 'enum',
    enum: DeliveryStatus,
    default: DeliveryStatus.PENDING,
  })
  delivery_status: DeliveryStatus;

  @Column({ type: 'enum', enum: PaymentMethod })
  payment_method: PaymentMethod;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  // Reference to prescription (required - every order is from a prescription)
  @ManyToOne(() => Prescription, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'prescription_id' })
  prescription: Relation<Prescription>;

  @Column()
  prescription_id: string;

  // Patient who places the order (from prescription)
  @ManyToOne(() => User, (user) => user.orders, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'patient_id' })
  patient: Relation<User>;

  @Column()
  patient_id: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
