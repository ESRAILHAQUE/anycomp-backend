import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ServiceOffering } from './ServiceOffering.entity';
import { Media } from './Media.entity';

export enum SpecialistStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

@Entity('specialists')
export class Specialist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  specialization: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  profile_image: string;

  @Column({
    type: 'enum',
    enum: SpecialistStatus,
    default: SpecialistStatus.DRAFT,
  })
  status: SpecialistStatus;

  @Column({ type: 'jsonb', nullable: true })
  additional_info: Record<string, any>;

  @OneToMany(() => ServiceOffering, (service) => service.specialist)
  service_offerings: ServiceOffering[];

  @OneToMany(() => Media, (media) => media.specialist)
  media: Media[];

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}

