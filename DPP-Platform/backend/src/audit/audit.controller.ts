import { Controller, Get, Query, UseGuards, UseInterceptors, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../common/guards/roles.guard';
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(LoggingInterceptor)
@Controller('audit')
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Query audit logs with filters' })
  async queryLogs(
    @CurrentUser() user: { organizationId: string },
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('action') action?: string,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.auditService.queryLogs(user.organizationId, {
      entityType,
      entityId,
      action,
      userId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      page: page || 1,
      limit: limit || 20,
    });
  }

  @Get('entity/:entityType/:entityId')
  @Roles('admin')
  @ApiOperation({ summary: 'Get audit logs for a specific entity' })
  async getEntityLogs(
    @Param('entityType') entityType: string,
    @Param('entityId', ParseUUIDPipe) entityId: string,
    @CurrentUser() user: { organizationId: string },
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.auditService.queryLogs(user.organizationId, {
      entityType,
      entityId,
      page: page || 1,
      limit: limit || 50,
    });
  }
}
