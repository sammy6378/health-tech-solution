import { Gender } from 'src/user-profile/dto/create-user-profile.dto';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

@Entity('doctorProfile')
export class DoctorProfile {
  @PrimaryGeneratedColumn('uuid')
  profile_id: string;

  @Column()
  license_number: string;

  @Column({ type: 'text' })
  specialization: string;

  @Column({ type: 'text' })
  years_of_experience: number;

  @Column({ type: 'text' })
  education: string;

  @Column({ type: 'text' })
  department: string;

  @Column({ type: 'text', array: true })
  days: string[];

  @Column()
  start_time: string;

  @Column()
  end_time: string;

  @Column({ type: 'text' })
  availability: boolean;

  @Column({ type: 'text' })
  phone_number: string;

  @Column({ type: 'enum', enum: Gender })
  sex: Gender;

  @Column({ type: 'text' })
  address: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  consultation_fee?: number;

  @Column('decimal', { array: true, nullable: true })
  ratings?: number[];

  @Column('text', { array: true, nullable: true })
  reviews?: string[];

  @Column('decimal', { nullable: true })
  bonus?: number;

  @Column({ type: 'text', nullable: true })
  avatar: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  @OneToOne(() => User, (user) => user.doctorProfile)
  user: Relation<User>;
}
