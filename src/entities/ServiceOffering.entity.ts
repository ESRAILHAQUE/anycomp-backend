import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Specialist } from './Specialist.entity';

@Entity('service_offerings')
export class ServiceOffering {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  service_name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({ type: 'varchar', length: 10, default: 'MYR', nullable: true })
  currency: string;

  @Column({ type: 'uuid' })
  specialist_id: string;

  @ManyToOne(() => Specialist, (specialist) => specialist.service_offerings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'specialist_id' })
  specialist: Specialist;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}

