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
import { UserProfile } from 'src/user-profile/entities/user-profile.entity';
import { DoctorProfile } from 'src/doctor-profile/entities/doctor-profile.entity';
import { Appointment } from 'src/appointments/entities/appointment.entity';

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

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @Column({ nullable: true })
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
      const saltRounds = 12;
      this.password = await Bcrypt.hash(this.password, saltRounds);
    }
  }

  async validatePassword(plainPassword: string): Promise<boolean> {
    return await Bcrypt.compare(plainPassword, this.password);
  }

  getPassword(): string {
    return this.password;
  }

  @OneToOne(() => UserProfile, (userProfile) => userProfile.user, {
    eager: true,
    cascade: true,
  })
  @JoinColumn()
  profile: UserProfile;

  @OneToOne(() => DoctorProfile, (doctorProfile) => doctorProfile.user, {
    eager: true,
    cascade: true,
  })
  @JoinColumn()
  doctorProfile: DoctorProfile;

  @OneToMany(() => Appointment, (appointment) => appointment.patient)
  appointments: Appointment[];

  @OneToMany(() => Appointment, (appointment) => appointment.doctor)
  doctorAppointments: Appointment[];
}
