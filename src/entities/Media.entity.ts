import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Specialist } from './Specialist.entity';

export enum MimeType {
  IMAGE_JPEG = 'image/jpeg',
  IMAGE_PNG = 'image/png',
  IMAGE_GIF = 'image/gif',
  IMAGE_WEBP = 'image/webp',
  VIDEO_MP4 = 'video/mp4',
  VIDEO_WEBM = 'video/webm',
  APPLICATION_PDF = 'application/pdf',
}

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
}

@Entity('media')
export class Media {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  specialists: string;

  @ManyToOne(() => Specialist, (specialist: Specialist) => specialist.media, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'specialists' })
  specialist: Specialist;

  @Column({ type: 'varchar', length: 255 })
  file_name: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  file_path: string;

  @Column({ type: 'int' })
  file_size: number;

  @Column({ type: 'int', default: 0 })
  display_order: number;

  @Column({
    type: 'enum',
    enum: MimeType,
    nullable: true,
  })
  mime_type: MimeType;

  @Column({
    type: 'enum',
    enum: MediaType,
  })
  media_type: MediaType;

  @Column({ type: 'timestamp', nullable: true })
  uploaded_at: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at: Date;
}
