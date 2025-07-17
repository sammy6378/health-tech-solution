import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Prescription } from './prescription.entity';
import { Stock } from 'src/pharmacy-stock/entities/stocks.entity';

@Entity('prescription_medications')
@Unique(['prescription', 'medication'])
export class PrescriptionMedication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(
    () => Prescription,
    (prescription) => prescription.prescriptionMedications,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'prescription_id' })
  prescription: Prescription;

  @ManyToOne(() => Stock, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'medication_id' })
  medication: Stock;

  @Column({ nullable: true })
  medication_name: string;

  @Column({ type: 'int' })
  quantity_prescribed: number;

  // How many days to take this medication
  @Column({ type: 'int', nullable: true })
  duration_days?: number;

  // How many times per day
  @Column({ type: 'int', nullable: true })
  frequency_per_day?: number;

  @Column('simple-array', { nullable: true })
  dosage_instructions: string[];
}
