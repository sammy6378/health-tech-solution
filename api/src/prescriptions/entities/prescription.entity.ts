import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { PrescriptionStatus } from '../dto/create-prescription.dto';
import { Diagnosis } from 'src/diagnosis/entities/diagnosis.entity';
import { PrescriptionMedication } from './prescription_medications.entity';

@Entity('prescriptions')
export class Prescription {
  @PrimaryGeneratedColumn('uuid')
  prescription_id: string;

  @Column({ unique: true })
  prescription_number: string;

  @Column({ type: 'int', default: 0 })
  total_price?: number;

  @Column({ type: 'date' })
  prescription_date: Date;

  // Prescription status
  @Column({
    type: 'enum',
    enum: PrescriptionStatus,
    default: PrescriptionStatus.PENDING,
  })
  status: PrescriptionStatus;

  @OneToMany(() => PrescriptionMedication, (pm) => pm.prescription, {
    cascade: true,
  })
  prescriptionMedications: PrescriptionMedication[];

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
