import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { PrescriptionStatus } from '../dto/create-prescription.dto';
import { Stock } from 'src/pharmacy-stock/entities/stocks.entity';

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

  // Who prescribed it (doctor)
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctor_id' })
  doctor: Relation<User>;

  @Column()
  doctor_id: string;

  // Who it's prescribed to (patient)
  @ManyToOne(() => User, (user) => user.prescriptions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patient_id' })
  patient: Relation<User>;

  @Column()
  patient_id: string;

  // Reference to the medication in stock
  @ManyToOne(() => Stock, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'medication_id' })
  medication: Relation<Stock>;

  @Column()
  medication_id: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
