import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { DocumentsService, MulterFile } from './documents.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';

@ApiTags('Documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(LoggingInterceptor)
@Controller('documents')
export class DocumentsController {
  constructor(private documentsService: DocumentsService) {}

  @Get()
  @Roles('admin', 'member', 'viewer')
  @ApiOperation({ summary: 'List documents for current organization' })
  async findAll(
    @CurrentUser() user: { organizationId: string },
    @Query('productId') productId?: string,
    @Query('type') type?: string,
  ) {
    return this.documentsService.findAll(user.organizationId, { productId, type });
  }

  @Get(':id')
  @Roles('admin', 'member', 'viewer')
  @ApiOperation({ summary: 'Get document by ID' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { organizationId: string },
  ) {
    return this.documentsService.findOne(id, user.organizationId);
  }

  @Get(':id/download')
  @Roles('admin', 'member', 'viewer')
  @ApiOperation({ summary: 'Get presigned download URL' })
  async getDownloadUrl(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { organizationId: string },
  ) {
    return this.documentsService.getDownloadUrl(id, user.organizationId);
  }

  @Post('upload')
  @Roles('admin', 'member')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Upload new document' })
  @ApiConsumes('multipart/form-data')
  async upload(
    @UploadedFile() file: MulterFile,
    @Body() metadata: Record<string, unknown>,
    @CurrentUser() user: { organizationId: string; sub: string },
  ) {
    return this.documentsService.upload(file, metadata, user.organizationId, user.sub);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete document' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { organizationId: string },
  ) {
    return this.documentsService.remove(id, user.organizationId);
  }

  @Get('product/:productId')
  @Roles('admin', 'member', 'viewer')
  @ApiOperation({ summary: 'Get documents for a specific product' })
  async getByProduct(
    @Param('productId', ParseUUIDPipe) productId: string,
    @CurrentUser() user: { organizationId: string },
  ) {
    return this.documentsService.getByProduct(productId, user.organizationId);
  }
}
