import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Relation,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Prescription } from 'src/prescriptions/entities/prescription.entity';
import { Appointment } from 'src/appointments/entities/appointment.entity';

@Entity('diagnosis')
export class Diagnosis {
  @PrimaryGeneratedColumn('uuid')
  diagnosis_id: string;

  @Column()
  diagnosis_name: string;

  @Column()
  treatment_plan: string;

  @Column({ type: 'date' })
  diagnosis_date: string;

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

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patient_id' })
  patient: Relation<User>;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctor_id' })
  doctor: Relation<User>;

  // One diagnosis can have multiple prescriptions
  @OneToMany(() => Prescription, (prescription) => prescription.diagnosis, {
    cascade: true,
  })
  @JoinColumn({ name: 'prescription_id' })
  prescriptions: Relation<Prescription[]>;

  @ManyToOne(() => Appointment, (appointment) => appointment.diagnoses, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'appointment_id' })
  appointment?: Relation<Appointment>;
}
