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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto, UserProfileDto } from './dto/auth.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, UserRequest } from '../common/decorators/current-user.decorator';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { UseInterceptors } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Authentication')
@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Register new organization + admin user
   * Creates both organization and first user (admin)
   */
  @Post('register')
  @Public()
  @Throttle({ default: { ttl: 60000, limit: 5 } }) // 5 registrations per minute
  @ApiOperation({ summary: 'Register new organization and admin user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'Organization and admin user created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async register(@Body() registerDto: RegisterDto) {
    // This will be implemented with UserRepository
    // For now, return a placeholder response
    return {
      message: 'Registration successful',
      user: {
        id: 'placeholder-user-id',
        email: registerDto.email,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        role: 'admin',
        organization: {
          id: 'placeholder-org-id',
          name: registerDto.organizationName,
          slug: registerDto.organizationName.toLowerCase().replace(/\s+/g, '-'),
        },
        createdAt: new Date(),
      },
      tokens: {
        accessToken: this.authService.generateAccessToken({
          sub: 'placeholder-user-id',
          email: registerDto.email,
          role: 'admin',
          organizationId: 'placeholder-org-id',
          firstName: registerDto.firstName,
          lastName: registerDto.lastName,
        }),
        refreshToken: this.authService.generateRefreshToken({
          sub: 'placeholder-user-id',
          email: registerDto.email,
          role: 'admin',
          organizationId: 'placeholder-org-id',
          firstName: registerDto.firstName,
          lastName: registerDto.lastName,
        }),
        expiresIn: 900,
      },
    };
  }

  /**
   * Login with email and password
   */
  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 1000, limit: 10 } }) // 10 login attempts per second
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful, returns tokens' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    // This will be implemented with UserRepository
    // For now, validate input and return placeholder
    if (!loginDto.email || !loginDto.password) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Email and password are required',
      };
    }

    // Placeholder: In real implementation, we would:
    // 1. Find user by email
    // 2. Compare password with hash
    // 3. Generate tokens
    // 4. Update lastLogin timestamp

    return {
      accessToken: this.authService.generateAccessToken({
        sub: 'placeholder-user-id',
        email: loginDto.email,
        role: 'admin',
        organizationId: 'placeholder-org-id',
        firstName: 'User',
        lastName: 'Test',
      }),
      refreshToken: this.authService.generateRefreshToken({
        sub: 'placeholder-user-id',
        email: loginDto.email,
        role: 'admin',
        organizationId: 'placeholder-org-id',
        firstName: 'User',
        lastName: 'Test',
      }),
      expiresIn: 900,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  @Post('refresh')
  @Public()
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 200, description: 'New access token generated' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    try {
      const payload = this.authService.verifyRefreshToken(refreshTokenDto.refreshToken);

      // Check if token is still valid (not expired)
      // In real implementation, we would check if refresh token is stored and not revoked

      const newTokens = {
        accessToken: this.authService.generateAccessToken(payload),
        refreshToken: this.authService.generateRefreshToken(payload),
        expiresIn: 900,
      };

      return newTokens;
    } catch (error) {
      throw error; // Will be caught by exception filter
    }
  }

  /**
   * Get current user profile
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiResponse({ status: 200, description: 'User profile data' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  async getProfile(@CurrentUser() user: { sub: string; email: string; role: string; organizationId: string; firstName?: string; lastName?: string }) {
    // In real implementation, fetch full user + organization from DB
    return {
      id: user.sub,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      organization: {
        id: user.organizationId,
        name: 'User Organization',
        slug: 'user-organization',
      },
      createdAt: new Date(),
    };
  }

  /**
   * Logout (client-side token removal)
   * Server-side: we would blacklist the refresh token
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Logout current session' })
  @ApiResponse({ status: 204, description: 'Logged out successfully' })
  async logout(@Request() req: UserRequest) {
    // In real implementation:
    // 1. Blacklist the refresh token (store in DB with expiry)
    // 2. Or delete refresh token from user's stored tokens
    // For now, client just discards tokens
    return;
  }
}
