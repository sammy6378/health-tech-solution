import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { StockCategory, StockType } from '../dto/create-stock.dto';

@Entity('stocks')
export class Stock {
  @PrimaryGeneratedColumn('uuid')
  medication_id: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text' })
  dosage: string;

  @Column('text', { array: true })
  side_effects: string[];

  @Column({ type: 'text' })
  manufacturer: string;

  @Column({ type: 'date' })
  expiration_date: Date;

  @Column({ type: 'enum', enum: StockCategory })
  category: StockCategory;

  @Column('decimal', { precision: 10, scale: 2 })
  unit_price: number;

  @Column({ type: 'text', unique: true })
  medication_code: string;

  @Column({ type: 'enum', enum: StockType })
  medication_type: StockType;

  @Column({ type: 'text', nullable: true })
  manufacturer_contact?: string;

  @Column({ type: 'text', nullable: true })
  image?: string;

  @Column({ type: 'int' })
  stock_quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  total_price: number;

  @Column({ type: 'boolean', default: false })
  prescription_required: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
