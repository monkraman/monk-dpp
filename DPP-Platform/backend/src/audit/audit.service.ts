import { Injectable } from '@nestjs/common';
import { AuditHelper, AuditEntry } from '../common/helpers/audit-helper.helper';
import { ConfigService } from '../config/configuration.service';
import { DataSource } from 'typeorm';

@Injectable()
export class AuditService {
  constructor(
    private auditHelper: AuditHelper,
    private configService: ConfigService,
    // private dataSource: DataSource, // Will be injected
  ) {}

  /**
   * Write audit log entry
   * This should be called after every write operation (create, update, delete, publish, etc.)
   */
  async log(entry: AuditEntry): Promise<void> {
    if (!this.auditHelper.isEnabled()) {
      return;
    }

    const sanitizedEntry = this.auditHelper.createEntry(entry);

    // In real implementation:
    // 1. Insert into audit_logs table (immutable - no update/delete)
    // 2. Use INSERT query (never UPDATE/DELETE)
    // 3. Store oldData and newData as JSONB
    
    console.log('[AUDIT]', JSON.stringify(sanitizedEntry, null, 2));
  }

  /**
   * Log product operations
   */
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

  /**
   * Log DPP operations
   */
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

  /**
   * Log document operations
   */
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

  /**
   * Log user operations
   */
  async logUser(
    orgId: string,
    userId: string,
    targetUserId: string,
    action: AuditEntry['action'],
    metadata?: Record<string, unknown>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.log({
      organizationId: orgId,
      userId,
      entityType: 'user',
      entityId: targetUserId,
      action,
      newData: metadata ? this.auditHelper.sanitizeData(metadata) : undefined,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Query audit logs with filters
   */
  async queryLogs(
    orgId: string,
    filters?: {
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
    // Placeholder — build query with filters, paginate
    return {
      data: [],
      meta: { total: 0, page: filters?.page || 1, limit: filters?.limit || 20 },
    };
  }
}
