import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User, UserRole } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

import { IsEmail, IsString, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  role?: UserRole;

  @IsOptional()
  @IsString()
  organizationId?: string;

  @IsOptional()
  @IsString()
  status?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  role?: UserRole;

  @IsOptional()
  @IsString()
  status?: string;
}

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  private sanitize(user: User) {
    const { password_hash, ...safe } = user;
    return safe;
  }

  /**
   * List users.
   * If super_admin: lists all users across organizations (or filtered by org).
   * If org_admin: lists users within their own organization.
   */
  @Get()
  @ApiOperation({ summary: 'List users according to permissions' })
  async findAll(
    @CurrentUser() currentUser: { sub: string; role: string; organizationId: string },
    @Query('organizationId') queryOrgId?: string,
  ) {
    let users: User[];

    if (currentUser.role === UserRole.SUPER_ADMIN) {
      if (queryOrgId) {
        users = await this.usersService.findByOrganization(queryOrgId);
      } else {
        users = await this.usersService.findAll();
      }
    } else {
      const orgId = currentUser.organizationId;
      if (!orgId) {
        return [];
      }
      users = await this.usersService.findByOrganization(orgId);
    }

    return users.map((u) => this.sanitize(u));
  }

  /**
   * Get single user by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() currentUser: { sub: string; role: string; organizationId: string },
  ) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (
      currentUser.role !== UserRole.SUPER_ADMIN &&
      user.organization_id !== currentUser.organizationId
    ) {
      throw new ForbiddenException('You do not have access to this user');
    }

    return this.sanitize(user);
  }

  /**
   * Create / Invite a new user
   */
  @Post()
  @ApiOperation({ summary: 'Create or invite new user' })
  async create(
    @Body() dto: CreateUserDto,
    @CurrentUser() currentUser: { sub: string; role: string; organizationId: string },
  ) {
    if (!dto.email) {
      throw new BadRequestException('Email is required');
    }

    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('A user with this email address already exists');
    }

    let targetOrgId = currentUser.organizationId;
    if (currentUser.role === UserRole.SUPER_ADMIN && dto.organizationId) {
      targetOrgId = dto.organizationId;
    }

    let role = dto.role || UserRole.ORG_ADMIN;
    // Only super_admin can create another super_admin
    if (role === UserRole.SUPER_ADMIN && currentUser.role !== UserRole.SUPER_ADMIN) {
      role = UserRole.ORG_ADMIN;
    }

    const plainPassword = dto.password || 'MonkPass2026!';
    const password_hash = await bcrypt.hash(plainPassword, 12);

    const user = await this.usersService.create({
      email: dto.email,
      first_name: dto.firstName,
      last_name: dto.lastName,
      password_hash,
      role,
      organization_id: targetOrgId,
      status: dto.status || 'active',
    });

    const fullUser = await this.usersService.findById(user.id);
    return this.sanitize(fullUser || user);
  }

  /**
   * Update user details or role
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update user' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() currentUser: { sub: string; role: string; organizationId: string },
  ) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (
      currentUser.role !== UserRole.SUPER_ADMIN &&
      user.organization_id !== currentUser.organizationId
    ) {
      throw new ForbiddenException('You do not have permission to update this user');
    }

    // Role escalation check
    if (dto.role && dto.role === UserRole.SUPER_ADMIN && currentUser.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only a super admin can grant super admin role');
    }

    const updated = await this.usersService.update(id, {
      first_name: dto.firstName,
      last_name: dto.lastName,
      role: dto.role,
      status: dto.status,
    });

    return this.sanitize(updated);
  }

  /**
   * Remove user
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Remove user' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: { sub: string; role: string; organizationId: string },
  ) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (
      currentUser.role !== UserRole.SUPER_ADMIN &&
      user.organization_id !== currentUser.organizationId
    ) {
      throw new ForbiddenException('You do not have permission to delete this user');
    }

    await this.usersService.remove(id);
    return { success: true, message: 'User removed successfully' };
  }
}
