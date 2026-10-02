import { Module } from '@nestjs/common';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { AuditHelper } from '../common/helpers/audit-helper.helper';

@Module({
  controllers: [AuditController],
  providers: [AuditService, AuditHelper],
  exports: [AuditService, AuditHelper],
})
export class AuditModule {}
