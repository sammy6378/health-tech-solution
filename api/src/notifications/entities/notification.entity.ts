import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('notifications')
export class Notification {
  // Primary key for the notification
  @PrimaryGeneratedColumn('uuid')
  notification_id: string;

  // Type of notification (e.g., 'order', 'payment', etc.)
  @Column({ type: 'varchar', length: 50 })
  type: string;

  // Title of the notification
  @Column({ type: 'varchar', length: 255 })
  title: string;

  // Content of the notification
  @Column({ type: 'text' })
  content: string;

  // User ID to whom the notification is sent
  @Column({ type: 'uuid' })
  user_id: string;

  // Optional attachments related to the notification
  @Column({ type: 'json', nullable: true })
  attachments?: string[];

  @ManyToOne(() => User, (user) => user.notifications)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
