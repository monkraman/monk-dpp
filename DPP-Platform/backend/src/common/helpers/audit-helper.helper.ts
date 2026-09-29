import { Injectable } from '@nestjs/common';
import { ConfigService } from '../../config/configuration.service';

export interface AuditEntry {
  organizationId: string;
  userId: string;
  entityType: string;
  entityId: string;
  action: 'create' | 'update' | 'delete' | 'publish' | 'view' | 'login' | 'logout' | 'export';
  oldData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AuditHelper {
  constructor(private configService: ConfigService) {}

  /**
   * Check if audit logging is enabled
   */
  isEnabled(): boolean {
    return this.configService.isAuditEnabled();
  }

  /**
   * Create audit entry object from request context
   */
  createEntry(params: AuditEntry): AuditEntry {
    const entry: AuditEntry = {
      organizationId: params.organizationId,
      userId: params.userId,
      entityType: params.entityType,
      entityId: params.entityId,
      action: params.action,
      oldData: params.oldData,
      newData: params.newData,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      metadata: params.metadata,
    };

    // Only include non-null fields
    return Object.fromEntries(
      Object.entries(entry).filter(([, value]) => value !== undefined),
    ) as AuditEntry;
  }

  /**
   * Sanitize data before storing in audit log
   * Remove sensitive fields (passwords, tokens, etc.)
   */
  sanitizeData(data: Record<string, unknown>): Record<string, unknown> {
    if (!data) return {};

    const sensitiveFields = ['password', 'passwordHash', 'token', 'refreshToken', 'apiKey', 'secret'];

    const sanitized = { ...data };

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        (sanitized as Record<string, unknown>)[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  /**
   * Get audit actions for entity type
   */
  getActionsForEntity(entityType: string): string[] {
    const actionMap: Record<string, string[]> = {
      product: ['create', 'update', 'delete', 'publish', 'view', 'export'],
      dpp: ['create', 'update', 'delete', 'publish', 'view', 'export'],
      document: ['upload', 'delete', 'view', 'download'],
      user: ['create', 'update', 'delete', 'login', 'logout'],
      organization: ['create', 'update', 'view'],
      supplier_request: ['create', 'update', 'respond', 'delete'],
    };

    return actionMap[entityType] || ['create', 'update', 'delete', 'view'];
  }
}
