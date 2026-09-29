import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DppsService } from './dpps.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';

@ApiTags('DPPs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(LoggingInterceptor)
@Controller('dpps')
export class DppsController {
  constructor(private dppsService: DppsService) {}

  @Get()
  @Roles('admin', 'member', 'viewer')
  @ApiOperation({ summary: 'List all DPPs for current organization' })
  async findAll(@CurrentUser() user: { organizationId: string }) {
    return this.dppsService.findAll(user.organizationId);
  }

  @Get(':id')
  @Roles('admin', 'member', 'viewer')
  @ApiOperation({ summary: 'Get DPP by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: { organizationId: string }) {
    return this.dppsService.findOne(id, user.organizationId);
  }

  @Post()
  @Roles('admin', 'member')
  @ApiOperation({ summary: 'Create DPP for a product' })
  async create(
    @Body() createDppDto: Record<string, unknown>,
    @CurrentUser() user: { organizationId: string; sub: string },
  ) {
    const productId = String(createDppDto['productId'] || '');
    return this.dppsService.create(createDppDto, productId, user.organizationId, user.sub);
  }

  @Put(':id')
  @Roles('admin', 'member')
  @ApiOperation({ summary: 'Update DPP data' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDppDto: Record<string, unknown>,
    @CurrentUser() user: { organizationId: string },
  ) {
    return this.dppsService.update(id, updateDppDto, user.organizationId);
  }

  @Put(':id/publish')
  @Roles('admin')
  @ApiOperation({ summary: 'Publish DPP (lock version, make visible)' })
  async publish(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: { organizationId: string }) {
    return this.dppsService.publish(id, user.organizationId);
  }

  @Get(':id/history')
  @Roles('admin', 'member', 'viewer')
  @ApiOperation({ summary: 'Get DPP version history' })
  async getHistory(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: { organizationId: string }) {
    return this.dppsService.getHistory(id, user.organizationId);
  }

  @Get('product/:productId')
  @Roles('admin', 'member', 'viewer')
  @ApiOperation({ summary: 'Get DPP for a specific product' })
  async getByProduct(
    @Param('productId', ParseUUIDPipe) productId: string,
    @CurrentUser() user: { organizationId: string },
  ) {
    return this.dppsService.getByProduct(productId, user.organizationId);
  }
}
