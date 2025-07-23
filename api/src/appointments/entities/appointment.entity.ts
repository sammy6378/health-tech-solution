import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import {
  AppointmentStatus,
  ConsultationType,
} from '../dto/create-appointment.dto';
import { User } from 'src/users/entities/user.entity';
import { Diagnosis } from 'src/diagnosis/entities/diagnosis.entity';

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  appointment_id: string;

  @Column()
  appointment_date: string;

  @Column({ default: 60 })
  duration_minutes: number;

  @Column()
  reason: string;

  @Column({ type: 'simple-array', nullable: true })
  time_slots: string[];

  @Column()
  start_time: string;

  @Column()
  end_time: string;

  @Column({ default: false })
  needs_meeting_link: boolean;

  @Column({ nullable: true })
  meeting_link: string;

  @Column('varchar', { nullable: true })
  zoom_meeting_id?: string;

  @Column()
  start_url: string;

  @Column({ type: 'enum', enum: ConsultationType })
  consultation_type: ConsultationType;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.SCHEDULED,
  })
  status: AppointmentStatus;

  @Column({ nullable: true })
  notes: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.appointments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  patient: Relation<User>;

  @ManyToOne(() => User, (user) => user.appointments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  doctor: Relation<User>;

  @OneToMany(() => Diagnosis, (diagnosis) => diagnosis.appointment)
  diagnoses: Relation<Diagnosis[]>;
}
