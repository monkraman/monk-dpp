import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import { IsEmail, IsString, IsOptional } from 'class-validator';

export class CreateOrgDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  logo_url?: string;
}

export class UpdateOrgDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  logo_url?: string;
}

@ApiTags('Organizations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orgs')
export class OrganizationsController {
  constructor(private readonly orgService: OrganizationsService) {}

  /**
   * List organizations.
   * Super Admin: gets all organizations.
   * Org Admin: gets their current organization in array format.
   */
  @Get()
  @ApiOperation({ summary: 'Get organizations' })
  async findAll(@CurrentUser() currentUser: { sub: string; role: string; organizationId: string }) {
    if (currentUser.role === UserRole.SUPER_ADMIN) {
      const orgs = await this.orgService.findAll();
      return orgs.map((o) => ({
        id: o.id,
        name: o.name,
        email: o.email,
        logo_url: o.logo_url,
        tenant_id: o.tenant_id,
        usersCount: o.users?.length || 0,
        createdAt: o.created_at,
      }));
    }

    if (!currentUser.organizationId) {
      return [];
    }

    const org = await this.orgService.findOne(currentUser.organizationId);
    if (!org) {
      return [];
    }

    return [
      {
        id: org.id,
        name: org.name,
        email: org.email,
        logo_url: org.logo_url,
        tenant_id: org.tenant_id,
        usersCount: org.users?.length || 0,
        createdAt: org.created_at,
      },
    ];
  }

  /**
   * Get single organization details
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get organization by ID' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() currentUser: { sub: string; role: string; organizationId: string },
  ) {
    if (currentUser.role !== UserRole.SUPER_ADMIN && currentUser.organizationId !== id) {
      throw new ForbiddenException('You do not have access to this organization');
    }

    const org = await this.orgService.findOne(id);
    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    return {
      id: org.id,
      name: org.name,
      email: org.email,
      logo_url: org.logo_url,
      tenant_id: org.tenant_id,
      users: (org.users || []).map((u) => ({
        id: u.id,
        email: u.email,
        firstName: u.first_name,
        lastName: u.last_name,
        role: u.role,
        status: u.status,
      })),
      createdAt: org.created_at,
    };
  }

  /**
   * Create organization (Super Admin only)
   */
  @Post()
  @ApiOperation({ summary: 'Create organization (Super Admin only)' })
  async create(
    @Body() body: CreateOrgDto,
    @CurrentUser() currentUser: { sub: string; role: string },
  ) {
    if (currentUser.role !== UserRole.SUPER_ADMIN && currentUser.role !== UserRole.ORG_ADMIN) {
      throw new ForbiddenException('Only Administrators can register a new organization');
    }

    return this.orgService.create({
      name: body.name,
      email: body.email,
      logo_url: body.logo_url,
    });
  }

  /**
   * Update organization details
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update organization' })
  async update(
    @Param('id') id: string,
    @Body() body: UpdateOrgDto,
    @CurrentUser() currentUser: { sub: string; role: string; organizationId: string },
  ) {
    if (currentUser.role !== UserRole.SUPER_ADMIN && currentUser.organizationId !== id) {
      throw new ForbiddenException('You do not have permission to update this organization');
    }

    return this.orgService.update(id, body);
  }
}
