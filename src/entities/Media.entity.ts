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

@Entity('media')
export class Media {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  file_name: string;

  @Column({ type: 'varchar', length: 500 })
  file_path: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  file_type: string;

  @Column({ type: 'bigint', nullable: true })
  file_size: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  mime_type: string;

  @Column({ type: 'uuid', nullable: true })
  specialist_id: string;

  @ManyToOne(() => Specialist, (specialist: Specialist) => specialist.media, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'specialist_id' })
  specialist: Specialist;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}

