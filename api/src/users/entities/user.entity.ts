import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from '../dto/create-user.dto';
import * as Bcrypt from 'bcrypt';
import { PatientProfile } from 'src/user-profile/entities/user-profile.entity';
import { DoctorProfile } from 'src/doctor-profile/entities/doctor-profile.entity';
import { Appointment } from 'src/appointments/entities/appointment.entity';
import { Pharmacy } from 'src/pharmacy/entities/pharmacy.entity';
import { Order } from 'src/orders/entities/order.entity';
import { MedicalRecord } from 'src/medical-records/entities/medical-record.entity';
import { Notification } from 'src/notifications/entities/notification.entity';
import { Diagnosis } from 'src/diagnosis/entities/diagnosis.entity';
import { Payment } from 'src/payments/entities/payment.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  user_id: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ type: 'enum', enum: Role, default: Role.PATIENT })
  role: Role;

  @Column({ nullable: true, select: false })
  refresh_token: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      const saltRounds = 10;
      this.password = await Bcrypt.hash(this.password, saltRounds);
    }
  }

  async validatePassword(plainPassword: string): Promise<boolean> {
    return await Bcrypt.compare(plainPassword, this.password);
  }

  @OneToOne(() => PatientProfile, (patientProfile) => patientProfile.patient, {
    eager: true,
    cascade: true,
  })
  @JoinColumn()
  patientProfile: PatientProfile;

  @OneToOne(() => DoctorProfile, (doctorProfile) => doctorProfile.user, {
    eager: true,
    cascade: true,
  })
  @JoinColumn()
  doctorProfile: DoctorProfile;

  @OneToOne(() => MedicalRecord, (medicalRecord) => medicalRecord.patient, {
    onDelete: 'CASCADE',
  })
  medicalRecord: MedicalRecord;

  @OneToMany(() => Appointment, (appointment) => appointment.patient)
  appointments: Appointment[];

  @OneToMany(() => Diagnosis, (diagnosis) => diagnosis.doctor, {
    onDelete: 'CASCADE',
  })
  diagnoses: Diagnosis[];

  @OneToMany(() => Appointment, (appointment) => appointment.doctor)
  doctorAppointments: Appointment[];

  @OneToMany(() => Pharmacy, (pharmacy) => pharmacy.user, {
    onDelete: 'CASCADE',
  })
  pharmacies: Pharmacy[];

  @OneToMany(() => Diagnosis, (diagnosis) => diagnosis.patient, {
    onDelete: 'CASCADE',
  })
  patientDiagnoses: Diagnosis[];

  @OneToMany(() => Diagnosis, (diagnosis) => diagnosis.doctor, {
    onDelete: 'CASCADE',
  })
  doctorDiagnoses: Diagnosis[];

  @OneToMany(() => Order, (order) => order.patient, {
    onDelete: 'CASCADE',
  })
  orders: Order[];

  @OneToMany(() => Payment, (payment) => payment.user, {
    onDelete: 'CASCADE',
  })
  payments: Payment[];

  @OneToMany(() => Notification, (notification) => notification.user, {
    onDelete: 'CASCADE',
  })
  notifications: Notification[];
}
