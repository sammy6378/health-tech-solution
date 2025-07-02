import {
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { Gender } from '../dto/create-user-profile.dto';
import { User } from 'src/users/entities/user.entity';

@Entity('userProfile')
export class UserProfile {
  @PrimaryGeneratedColumn('uuid')
  profile_id: string;

  @Column()
  phone_number: string;

  @Column()
  address: string;

  @Column({ type: 'enum', enum: Gender })
  sex: Gender;

  @Column({ type: 'date' })
  date_of_birth: Date;

  @Column({ type: 'int' })
  age: number;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  state?: string;

  @Column({ nullable: true })
  country?: string;

  @Column({ nullable: true })
  postal_code?: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @OneToOne(() => User, (user) => user.profile)
  user: Relation<User>;
}
