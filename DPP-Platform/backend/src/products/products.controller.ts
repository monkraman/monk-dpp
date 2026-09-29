import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/guards/roles.guard';
import { UseInterceptors } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(require('../common/interceptors/logging.interceptor').LoggingInterceptor)
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  @Roles('admin', 'member', 'viewer')
  @ApiOperation({ summary: 'List all products for current organization' })
  async findAll(@Query() query: Record<string, unknown>, @CurrentUser() user: { organizationId: string }) {
    return this.productsService.findAll(user.organizationId, query);
  }

  @Get(':id')
  @Roles('admin', 'member', 'viewer')
  @ApiOperation({ summary: 'Get product by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: { organizationId: string }) {
    return this.productsService.findOne(id, user.organizationId);
  }

  @Post()
  @Roles('admin', 'member')
  @ApiOperation({ summary: 'Create new product' })
  async create(@Body() createProductDto: Record<string, unknown>, @CurrentUser() user: { organizationId: string; sub: string }) {
    return this.productsService.create(createProductDto, user.organizationId, user.sub);
  }

  @Put(':id')
  @Roles('admin', 'member')
  @ApiOperation({ summary: 'Update product' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() updateProductDto: Record<string, unknown>, @CurrentUser() user: { organizationId: string }) {
    return this.productsService.update(id, updateProductDto, user.organizationId);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete (archive) product' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: { organizationId: string }) {
    return this.productsService.remove(id, user.organizationId);
  }

  @Post(':id/publish')
  @Roles('admin', 'member')
  @ApiOperation({ summary: 'Publish product and generate QR code' })
  async publish(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: { organizationId: string }) {
    return this.productsService.publish(id, user.organizationId);
  }
}
