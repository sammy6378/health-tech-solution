import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

@Entity('pharmacy')
export class Pharmacy {
  @PrimaryGeneratedColumn('uuid')
  pharmacy_id: string;

  @Column()
  business_name: string;

  @Column()
  address: string;

  @Column()
  phone_number: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', unique: true })
  license_number: string;

  @Column({ type: 'text', nullable: true })
  city?: string;

  @Column({ type: 'text', nullable: true })
  image?: string;

  @Column({ type: 'text', nullable: true })
  state?: string;

  @Column({ type: 'text', nullable: true })
  zip_code?: string;

  @Column({ type: 'text', nullable: true })
  country?: string;

  @Column({ type: 'text', nullable: true })
  opening_hours?: string;

  @Column({ type: 'text', nullable: true })
  website?: string;

  @Column({ type: 'text', nullable: true })
  closing_hours?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.pharmacies)
  user: Relation<User>;
}
