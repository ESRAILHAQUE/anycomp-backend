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

  @Column({ type: 'uuid' })
  specialists: string;

  @ManyToOne(() => Specialist, (specialist) => specialist.service_offerings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'specialists' })
  specialist: Specialist;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
