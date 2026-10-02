import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';
import { Product } from '../../products/entities/product.entity';
import { User } from '../../users/entities/user.entity';

@Entity('dpps')
export class Dpp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  product_id?: string;

  @ManyToOne(() => Product, (product) => product.dpps, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'product_id' })
  product?: Product;

  @Column({ type: 'uuid', nullable: true })
  organization_id?: string;

  @ManyToOne(() => Organization, (org) => org.dpps, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'organization_id' })
  organization?: Organization;

  // Tiered Data JSONB
  @Column({ type: 'jsonb', nullable: true })
  public_data?: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  professional_data?: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  authority_data?: Record<string, unknown>;

  // Publication
  @Column({ type: 'text', nullable: true })
  qr_code_url?: string;

  @Column({ type: 'text', nullable: true })
  gs1_digital_link?: string;

  @Column({ type: 'varchar', default: 'draft' })
  status: string; // draft / published / archived

  @Column({ type: 'timestamp with time zone', nullable: true })
  published_at?: Date;

  @Column({ type: 'boolean', default: false })
  eidas_signed: boolean;

  @Column({ type: 'text', nullable: true })
  eidas_signature?: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  eidas_timestamp?: Date;

  @Column({ type: 'integer', default: 1 })
  version: number;

  @Column({ type: 'uuid', nullable: true })
  created_by?: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  creator?: User;

  @CreateDateColumn({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
