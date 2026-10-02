import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  organization_id?: string;

  @Column({ type: 'uuid', nullable: true })
  user_id?: string;

  @Column({ type: 'varchar' })
  entity_type: string;

  @Column({ type: 'uuid' })
  entity_id: string;

  @Column({ type: 'varchar' })
  action: string;

  @Column({ type: 'jsonb', nullable: true })
  old_data?: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  new_data?: Record<string, unknown>;

  @Column({ type: 'inet', nullable: true })
  ip_address?: string;

  @Column({ type: 'text', nullable: true })
  user_agent?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  @CreateDateColumn({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
