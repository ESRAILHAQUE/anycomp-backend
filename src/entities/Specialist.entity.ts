import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { ServiceOffering } from './ServiceOffering.entity';
import { Media } from './Media.entity';

export enum VerificationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  UNDER_REVIEW = 'under-review',
}

@Entity('specialists')
export class Specialist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0, nullable: true })
  average_rating: number;

  @Column({ type: 'boolean', default: true })
  is_draft: boolean;

  @Column({ type: 'int', default: 0 })
  total_number_of_ratings: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  base_price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  platform_fee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  final_price: number;

  @Column({
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.PENDING,
  })
  verification_status: VerificationStatus;

  @Column({ type: 'boolean', default: false })
  is_verified: boolean;

  @Column({ type: 'int' })
  duration_days: number;

  @OneToMany(() => ServiceOffering, (service) => service.specialist)
  service_offerings: ServiceOffering[];

  @OneToMany(() => Media, (media) => media.specialist)
  media: Media[];

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at: Date;
}
