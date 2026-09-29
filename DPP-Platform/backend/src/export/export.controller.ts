import { Controller, Get, Param, UseGuards, UseInterceptors, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiProduces } from '@nestjs/swagger';
import { ExportService } from './export.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/guards/roles.guard';
import { Public } from '../common/decorators/public.decorator';
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';

@ApiTags('Export')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(LoggingInterceptor)
@Controller('export')
export class ExportController {
  constructor(private exportService: ExportService) {}

  // ===== JSON-LD Exports =====

  @Get('products/:id/jsonld')
  @Roles('admin', 'member', 'viewer')
  @ApiOperation({ summary: 'Export single product as JSON-LD' })
  async exportProductJsonLd(@Param('id', ParseUUIDPipe) id: string) {
    return this.exportService.exportProductJsonLd(id);
  }

  @Get('dpps/:id/jsonld')
  @Roles('admin', 'member', 'viewer')
  @ApiOperation({ summary: 'Export single DPP as JSON-LD' })
  async exportDppJsonLd(@Param('id', ParseUUIDPipe) id: string) {
    return this.exportService.exportDppJsonLd(id);
  }

  // ===== CSV Exports =====

  @Get('products/csv')
  @Roles('admin', 'member')
  @ApiOperation({ summary: 'Export product list as CSV' })
  async exportProductsCsv(@Query('category') category?: string, @Query('status') status?: string) {
    return this.exportService.exportProductsCsv(
      'current-org-id', // Will come from CurrentUser
      { category, status },
    );
  }

  @Get('dpps/csv')
  @Roles('admin', 'member')
  @ApiOperation({ summary: 'Export DPP list as CSV' })
  async exportDppsCsv() {
    return this.exportService.exportDppsCsv('current-org-id');
  }

  // ===== PDF Reports =====

  @Get(':type/:id/report')
  @Roles('admin', 'member')
  @ApiProduces('application/pdf')
  @ApiOperation({ summary: 'Export PDF report for product or DPP' })
  async exportPdf(@Param('type') type: 'dpp' | 'product', @Param('id', ParseUUIDPipe) id: string) {
    return this.exportService.exportPdf(type, id);
  }

  // ===== Public JSON-LD (for QR scan) =====

  @Get('public/jsonld/:identifier')
  @Public()
  @ApiOperation({ summary: 'Get JSON-LD for public DPP (QR scan resolution)' })
  async getPublicJsonLd(@Param('identifier') identifier: string) {
    // Placeholder — resolve identifier to DPP, return JSON-LD
    return {
      identifier,
      jsonLd: {},
    };
  }
}
