import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditHelper, AuditEntry } from '../common/helpers/audit-helper.helper';
import { ConfigService } from '../config/configuration.service';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    private auditHelper: AuditHelper,
    private configService: ConfigService,
    @InjectRepository(AuditLog)
    private readonly auditLogRepo: Repository<AuditLog>,
  ) {}

  /**
   * Write audit log entry into PostgreSQL audit_logs table (immutable)
   */
  async log(entry: AuditEntry): Promise<void> {
    if (!this.auditHelper.isEnabled()) {
      return;
    }

    const sanitizedEntry = this.auditHelper.createEntry(entry);

    try {
      const logRecord = this.auditLogRepo.create({
        organization_id: sanitizedEntry.organizationId,
        user_id: sanitizedEntry.userId,
        entity_type: sanitizedEntry.entityType,
        entity_id: sanitizedEntry.entityId,
        action: sanitizedEntry.action,
        old_data: sanitizedEntry.oldData,
        new_data: sanitizedEntry.newData,
        ip_address: sanitizedEntry.ipAddress,
        user_agent: sanitizedEntry.userAgent,
        metadata: sanitizedEntry.metadata,
      });

      await this.auditLogRepo.save(logRecord);
    } catch (err) {
      console.error('[AUDIT WRITE ERROR]', err);
    }
  }

  async logProduct(
    orgId: string,
    userId: string,
    productId: string,
    action: AuditEntry['action'],
    oldData?: Record<string, unknown>,
    newData?: Record<string, unknown>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.log({
      organizationId: orgId,
      userId,
      entityType: 'product',
      entityId: productId,
      action,
      oldData: oldData ? this.auditHelper.sanitizeData(oldData) : undefined,
      newData: newData ? this.auditHelper.sanitizeData(newData) : undefined,
      ipAddress,
      userAgent,
    });
  }

  async logDpp(
    orgId: string,
    userId: string,
    dppId: string,
    action: AuditEntry['action'],
    oldData?: Record<string, unknown>,
    newData?: Record<string, unknown>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.log({
      organizationId: orgId,
      userId,
      entityType: 'dpp',
      entityId: dppId,
      action,
      oldData: oldData ? this.auditHelper.sanitizeData(oldData) : undefined,
      newData: newData ? this.auditHelper.sanitizeData(newData) : undefined,
      ipAddress,
      userAgent,
    });
  }

  async logDocument(
    orgId: string,
    userId: string,
    documentId: string,
    action: AuditEntry['action'],
    metadata?: Record<string, unknown>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.log({
      organizationId: orgId,
      userId,
      entityType: 'document',
      entityId: documentId,
      action,
      newData: metadata ? this.auditHelper.sanitizeData(metadata) : undefined,
      ipAddress,
      userAgent,
    });
  }

  async logUser(
    orgId: string,
    actorId: string,
    targetUserId: string,
    action: AuditEntry['action'],
    oldData?: Record<string, unknown>,
    newData?: Record<string, unknown>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.log({
      organizationId: orgId,
      userId: actorId,
      entityType: 'user',
      entityId: targetUserId,
      action,
      oldData: oldData ? this.auditHelper.sanitizeData(oldData) : undefined,
      newData: newData ? this.auditHelper.sanitizeData(newData) : undefined,
      ipAddress,
      userAgent,
    });
  }

  async logAuth(
    userId: string,
    action: 'login' | 'logout',
    orgId?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.log({
      organizationId: orgId || '',
      userId,
      entityType: 'auth',
      entityId: userId,
      action,
      ipAddress,
      userAgent,
    });
  }

  async findByEntity(entityType: string, entityId: string, orgId: string): Promise<AuditLog[]> {
    return this.auditLogRepo.find({
      where: { entity_type: entityType, entity_id: entityId, organization_id: orgId },
      order: { created_at: 'DESC' },
    });
  }

  async queryLogs(
    orgId: string,
    filters: {
      entityType?: string;
      entityId?: string;
      action?: string;
      userId?: string;
      startDate?: Date;
      endDate?: Date;
      page?: number;
      limit?: number;
    },
  ) {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filters.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = { organization_id: orgId };
    if (filters.entityType) where.entity_type = filters.entityType;
    if (filters.entityId) where.entity_id = filters.entityId;
    if (filters.action) where.action = filters.action;
    if (filters.userId) where.user_id = filters.userId;

    const [items, total] = await this.auditLogRepo.findAndCount({
      where,
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findAll(orgId: string, limit = 50): Promise<AuditLog[]> {
    return this.auditLogRepo.find({
      where: { organization_id: orgId },
      order: { created_at: 'DESC' },
      take: limit,
    });
  }
}
