import { Controller, Get, Post, Put, Body, Param, UseGuards, ParseUUIDPipe, HttpCode, HttpStatus, Query, Delete, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SuppliersService } from './suppliers.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../common/guards/roles.guard';
import { Public } from '../common/decorators/public.decorator';
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Suppliers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(LoggingInterceptor)
@Controller('supplier-requests')
export class SuppliersController {
  constructor(private suppliersService: SuppliersService) {}

  @Get()
  @Roles('admin', 'member')
  @ApiOperation({ summary: 'List all supplier data requests' })
  async findAll(@CurrentUser() user: { organizationId: string }) {
    return this.suppliersService.findAllRequests(user.organizationId);
  }

  @Get(':id')
  @Roles('admin', 'member')
  @ApiOperation({ summary: 'Get supplier request by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: { organizationId: string }) {
    return this.suppliersService.findOneRequest(id, user.organizationId);
  }

  @Post()
  @Roles('admin', 'member')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new supplier data request' })
  async create(@Body() createRequestDto: Record<string, unknown>, @CurrentUser() user: { organizationId: string; sub: string }) {
    return this.suppliersService.createRequest(createRequestDto, user.organizationId, user.sub);
  }

  @Put(':id')
  @Roles('admin', 'member')
  @ApiOperation({ summary: 'Update supplier request status' })
  async updateStatus(@Param('id', ParseUUIDPipe) id: string, @Body() body: { status: string }, @CurrentUser() user: { organizationId: string }) {
    return this.suppliersService.updateRequestStatus(id, body.status, user.organizationId);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete supplier request' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: { organizationId: string }) {
    // TODO: Implement
    return;
  }

  // Public endpoint for suppliers to respond (no auth, token-based)
  @Post(':id/respond')
  @Public()
  @ApiOperation({ summary: 'Supplier responds to data request (token-based access)' })
  async respond(@Param('id', ParseUUIDPipe) id: string, @Body() responseData: Record<string, unknown>, @Query('token') token: string) {
    return this.suppliersService.respondToRequest(id, responseData, token);
  }
}
