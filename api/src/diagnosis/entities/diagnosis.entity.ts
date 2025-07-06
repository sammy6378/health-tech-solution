import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Prescription } from 'src/prescriptions/entities/prescription.entity';

@Entity('diagnosis')
export class Diagnosis {
  @PrimaryGeneratedColumn('uuid')
  diagnosis_id: string;

  // Remove the string columns and replace with proper relationships
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patient_id' })
  patient: User;

  @Column()
  patient_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctor_id' })
  doctor: User;

  @Column()
  doctor_id: string;

  // One diagnosis can have multiple prescriptions
  @OneToMany(() => Prescription, (prescription) => prescription.diagnosis, {
    cascade: true,
  })
  prescriptions: Prescription[];

  @Column()
  diagnosis: string;

  @Column()
  treatment_plan: string;

  @Column({ type: 'date' })
  record_date: Date;

  @Column('text', { array: true, nullable: true })
  notes?: string[];

  @Column('text', { array: true, nullable: true })
  docs?: string[];

  @Column('text', { array: true, nullable: true })
  tests?: string[];

  @Column('text', { array: true, nullable: true })
  allergies?: string[];

  @Column('text', { array: true, nullable: true })
  symptoms?: string[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
