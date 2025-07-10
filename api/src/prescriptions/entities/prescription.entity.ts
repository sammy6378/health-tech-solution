import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { PrescriptionStatus } from '../dto/create-prescription.dto';
import { Stock } from 'src/pharmacy-stock/entities/stocks.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Diagnosis } from 'src/diagnosis/entities/diagnosis.entity';

@Entity('prescriptions')
export class Prescription {
  @PrimaryGeneratedColumn('uuid')
  prescription_id: string;

  @Column({ unique: true })
  prescription_number: string;

  @Column({ type: 'date' })
  prescription_date: Date;

  // How many days to take this medication
  @Column({ type: 'int', nullable: true })
  duration_days?: number;

  // How many times per day
  @Column({ type: 'int', nullable: true })
  frequency_per_day?: number;

  // Quantity prescribed
  @Column({ type: 'int' })
  quantity_prescribed: number;

  // Quantity actually dispensed (may be less if insufficient stock)
  @Column({ type: 'int', default: 0 })
  quantity_dispensed: number;

  // Price from the pharmacy stock
  @Column('decimal', { precision: 10, scale: 2 })
  unit_price?: number;

  // Total price (quantity * unit_price)
  @Column('decimal', { precision: 10, scale: 2 })
  total_price: number;

  // Dosage instructions
  @Column('text', { array: true })
  dosage_instructions: string[];

  @Column({ nullable: true })
  notes?: string;

  // Prescription status
  @Column({
    type: 'enum',
    enum: PrescriptionStatus,
    default: PrescriptionStatus.PENDING,
  })
  status: PrescriptionStatus;

  // Reference to the medication in stock
  @ManyToMany(() => Stock, { onDelete: 'RESTRICT' })
  @JoinTable({
    name: 'prescription_medications',
    joinColumn: {
      name: 'prescription_id',
      referencedColumnName: 'prescription_id',
    },
    inverseJoinColumn: {
      name: 'medication_id',
      referencedColumnName: 'medication_id',
    },
  })
  medications: Relation<Stock[]>;

  @OneToOne(() => Order, (order) => order.prescription, { nullable: true })
  order: Order;

  @Column()
  diagnosis_id: string;

  @ManyToOne(() => Diagnosis, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'diagnosis_id' })
  diagnosis: Relation<Diagnosis>;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
