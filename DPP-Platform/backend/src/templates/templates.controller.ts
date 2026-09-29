import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TemplatesService } from './templates.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../common/guards/roles.guard';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';

@ApiTags('Templates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(LoggingInterceptor)
@Controller('templates')
export class TemplatesController {
  constructor(private templatesService: TemplatesService) {}

  @Get()
  @Roles('admin', 'member', 'viewer')
  @ApiOperation({ summary: 'List all templates' })
  async findAll(
    @CurrentUser() user: { organizationId: string },
    @Query('industry') industry?: string,
  ) {
    return this.templatesService.findAll(industry);
  }

  @Get('industry/:industry')
  @Public()
  @ApiOperation({ summary: 'Get default template for an industry (public)' })
  async getByIndustry(@Param('industry') industry: string) {
    return this.templatesService.getByIndustry(industry);
  }

  @Get(':id')
  @Roles('admin', 'member')
  @ApiOperation({ summary: 'Get template by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.templatesService.findOne(id);
  }

  @Get(':id/schema')
  @Roles('admin', 'member', 'viewer')
  @ApiOperation({ summary: 'Get template schema (field definitions)' })
  async getSchema(@Param('id', ParseUUIDPipe) id: string) {
    return this.templatesService.getSchema(id);
  }

  @Post()
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new template' })
  async create(
    @Body() createTemplateDto: Record<string, unknown>,
    @CurrentUser() user: { organizationId: string; sub: string },
  ) {
    return this.templatesService.create(createTemplateDto, user.organizationId, user.sub);
  }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update template' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTemplateDto: Record<string, unknown>,
    @CurrentUser() user: { organizationId: string },
  ) {
    return this.templatesService.update(id, updateTemplateDto, user.organizationId);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete template' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { organizationId: string },
  ) {
    return this.templatesService.remove(id, user.organizationId);
  }
}
