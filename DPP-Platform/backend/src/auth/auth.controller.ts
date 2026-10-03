import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Get,
  ClassSerializerInterceptor,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto/auth.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, UserRequest } from '../common/decorators/current-user.decorator';
import { Throttle } from '@nestjs/throttler';
import { UseInterceptors } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { UsersService } from '../users/users.service';
import { OrganizationsService } from '../organizations/organizations.service';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Authentication')
@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly orgService: OrganizationsService,
  ) {}

  /**
   * Register new organization + admin user in PostgreSQL
   */
  @Post('register')
  @Public()
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @ApiOperation({ summary: 'Register new organization and admin user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'Organization and admin user created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async register(@Body() registerDto: RegisterDto) {
    const existing = await this.usersService.findByEmail(registerDto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    // 1. Create Organization
    const organization = await this.orgService.create({
      name: registerDto.organizationName,
      email: registerDto.email,
    });

    // 2. Hash Password
    const password_hash = await this.authService.hashPassword(registerDto.password);

    // 3. Create Admin User
    const user = await this.usersService.create({
      organization_id: organization.id,
      email: registerDto.email,
      password_hash,
      first_name: registerDto.firstName,
      last_name: registerDto.lastName,
      role: UserRole.ORG_ADMIN,
      status: 'active',
    });

    // 4. Generate JWT Tokens
    const tokens = this.authService.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
      organizationId: organization.id,
      firstName: user.first_name,
      lastName: user.last_name,
    });

    return {
      message: 'Registration successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        organization: {
          id: organization.id,
          name: organization.name,
        },
        createdAt: user.created_at,
      },
      tokens,
    };
  }

  /**
   * Login with email and password verified against PostgreSQL
   */
  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 1000, limit: 10 } })
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful, returns tokens' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    if (!loginDto.email || !loginDto.password) {
      throw new BadRequestException('Email and password are required');
    }

    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await this.authService.comparePasswords(
      loginDto.password,
      user.password_hash,
    );
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = this.authService.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organization_id || '',
      firstName: user.first_name,
      lastName: user.last_name,
    });

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        organizationId: user.organization_id,
        organization: user.organization ? {
          id: user.organization.id,
          name: user.organization.name,
        } : null,
      },
    };
  }

  /**
   * Refresh access token
   */
  @Post('refresh')
  @Public()
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({ type: RefreshTokenDto })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    try {
      const payload = this.authService.verifyRefreshToken(refreshTokenDto.refreshToken);
      return {
        accessToken: this.authService.generateAccessToken(payload),
        refreshToken: this.authService.generateRefreshToken(payload),
        expiresIn: 900,
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  /**
   * Get current authenticated user profile
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  async getProfile(@CurrentUser() currentUser: { sub: string }) {
    const user = await this.usersService.findById(currentUser.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      organizationId: user.organization_id,
      organization: user.organization ? {
        id: user.organization.id,
        name: user.organization.name,
      } : null,
      createdAt: user.created_at,
    };
  }

  /**
   * Logout
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Logout current session' })
  async logout(@Request() req: UserRequest) {
    return;
  }
}
