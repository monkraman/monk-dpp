import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';
import { User } from '../../users/entities/user.entity';
import { Dpp } from '../../dpps/entities/dpp.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  organization_id?: string;

  @ManyToOne(() => Organization, (org) => org.products, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'organization_id' })
  organization?: Organization;

  // Public Fields (EU Battery Regulation Annex VI)
  @Column({ type: 'text', nullable: true })
  product_identifier?: string; // GS1 Digital Link URI

  @Column({ type: 'text', nullable: true })
  battery_category?: string; // EV / LMT / Industrial

  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true })
  mass_kg?: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true })
  energy_capacity_wh?: number;

  @Column({ type: 'text', nullable: true })
  chemistry?: string; // NMC, LFP, etc.

  @Column({ type: 'text', nullable: true })
  hazardous_substances?: string;

  @Column({ type: 'date', nullable: true })
  manufacture_date?: string;

  @Column({ type: 'text', nullable: true })
  gtin?: string;

  @Column({ type: 'text', nullable: true })
  serial_number?: string;

  @Column({ type: 'text', nullable: true })
  brand_name?: string;

  @Column({ type: 'text', nullable: true })
  model_name?: string;

  // Professional Fields (Annex XIII)
  @Column({ type: 'decimal', precision: 6, scale: 3, nullable: true })
  nominal_voltage?: number;

  @Column({ type: 'decimal', precision: 6, scale: 3, nullable: true })
  max_voltage?: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true })
  original_power_watts?: number;

  @Column({ type: 'integer', nullable: true })
  cycle_life_cycles?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  round_trip_efficiency?: number;

  @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
  battery_lifetime_years?: number;

  @Column({ type: 'text', nullable: true })
  parts_materials?: string;

  @Column({ type: 'text', nullable: true })
  spare_parts_supplier?: string;

  // Authority Fields
  @Column({ type: 'text', nullable: true })
  manufacturer_name?: string;

  @Column({ type: 'text', nullable: true })
  manufacturer_plant_location?: string;

  @Column({ type: 'text', array: true, nullable: true })
  eu_conformity_docs?: string[];

  @Column({ type: 'text', nullable: true })
  product_life_instructions?: string;

  // Metadata
  @Column({ type: 'integer', default: 1 })
  version: number;

  @Column({ type: 'varchar', default: 'draft' })
  status: string; // draft / published / archived

  @Column({ type: 'timestamp with time zone', nullable: true })
  published_at?: Date;

  @Column({ type: 'uuid', nullable: true })
  created_by?: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  creator?: User;

  @OneToMany(() => Dpp, (dpp) => dpp.product)
  dpps: Dpp[];

  @CreateDateColumn({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
