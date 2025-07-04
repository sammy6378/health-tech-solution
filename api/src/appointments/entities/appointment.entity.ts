import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import {
  AppointmentStatus,
  ConsultationType,
} from '../dto/create-appointment.dto';
import { User } from 'src/users/entities/user.entity';

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  appointment_id: string;

  @Column()
  appointment_date: Date;

  @Column()
  appointment_time: string;

  @Column()
  duration_minutes: number;

  @Column({ type: 'enum', enum: ConsultationType })
  consultation_type: ConsultationType;

  @Column({ type: 'enum', enum: AppointmentStatus })
  status: AppointmentStatus;

  @Column({ nullable: true })
  notes: string;

  @ManyToOne(() => User, (user) => user.appointments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  patient: Relation<User>;

  @ManyToOne(() => User, (user) => user.doctorAppointments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  doctor: Relation<User>;
}
