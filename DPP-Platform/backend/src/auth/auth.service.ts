import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '../config/configuration.service';
import * as bcrypt from 'bcrypt';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  organizationId: string;
  firstName?: string;
  lastName?: string;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    // UserRepository will be injected later
  ) {}

  /**
   * Hash password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Compare password with hash
   */
  async comparePasswords(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate JWT access token
   */
  generateAccessToken(payload: JwtPayload): string {
    const secret = this.configService.getJwtSecret();
    const expiration = this.configService.getJwtExpiration();

    return this.jwtService.sign(payload, {
      secret,
      expiresIn: expiration,
    });
  }

  /**
   * Generate refresh token (longer expiration)
   */
  generateRefreshToken(payload: JwtPayload): string {
    const secret = this.configService.getJwtSecret();
    const expiration = this.configService.getRefreshTokenExpiration();

    return this.jwtService.sign(payload, {
      secret,
      expiresIn: expiration,
      algorithm: 'HS256',
    });
  }

  /**
   * Generate both access and refresh tokens
   */
  generateTokens(payload: JwtPayload): Tokens {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
      expiresIn: 900, // 15 minutes in seconds
    };
  }

  /**
   * Verify access token
   */
  verifyAccessToken(token: string): JwtPayload {
    const secret = this.configService.getJwtSecret();
    return this.jwtService.verify(token, { secret }) as JwtPayload;
  }

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token: string): JwtPayload {
    const secret = this.configService.getJwtSecret();
    return this.jwtService.verify(token, { secret }) as JwtPayload;
  }

  /**
   * Get user profile from token payload
   */
  getUserProfileFromPayload(payload: JwtPayload) {
    return {
      id: payload.sub,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      role: payload.role,
      organizationId: payload.organizationId,
    };
  }
}
