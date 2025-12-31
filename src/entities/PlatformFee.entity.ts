import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TierName {
  TIER_1 = 'tier_1',
  TIER_2 = 'tier_2',
  TIER_3 = 'tier_3',
  TIER_4 = 'tier_4',
  TIER_5 = 'tier_5',
}

@Entity('platform_fee')
export class PlatformFee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: TierName,
  })
  tier_name: TierName;

  @Column({ type: 'int' })
  min_value: number;

  @Column({ type: 'int' })
  max_value: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  platform_fee_percentage: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
