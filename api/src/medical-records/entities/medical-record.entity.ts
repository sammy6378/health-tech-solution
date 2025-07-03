import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('medical_records')
export class MedicalRecord {
  @PrimaryGeneratedColumn('uuid')
  record_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patient_id' })
  patient: User;

  @Column({ type: 'int' })
  patient_id: string;

  @Column({ type: 'date', nullable: true })
  record_date?: Date;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text', nullable: true })
  diagnosis?: string;

  @Column({ type: 'text', nullable: true })
  treatment_plan?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  blood_pressure?: string;

  @Column({ type: 'int', nullable: true })
  heart_rate?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  temperature?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  height?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  BMI?: number;

  @Column('text', { array: true, nullable: true })
  allergies?: string[];

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column('text', { array: true, nullable: true })
  docs?: string[];
}
