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

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ORG_ADMIN = 'org_admin',
  PRODUCT_MANAGER = 'product_manager',
  COMPLIANCE = 'compliance',
  VIEWER = 'viewer',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  organization_id?: string;

  @ManyToOne(() => Organization, (org) => org.users, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'organization_id' })
  organization?: Organization;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  password_hash: string;

  @Column({ type: 'varchar', nullable: true })
  first_name?: string;

  @Column({ type: 'varchar', nullable: true })
  last_name?: string;

  @Column({
    type: 'varchar',
    default: UserRole.VIEWER,
  })
  role: UserRole;

  @Column({ type: 'varchar', default: 'active' })
  status: string;

  @Column({ type: 'boolean', default: false })
  mfa_enabled: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
