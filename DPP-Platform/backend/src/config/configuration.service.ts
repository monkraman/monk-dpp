import * as fs from 'fs';
import * as path from 'path';
import { Injectable } from '@nestjs/common';

interface EnvConfig {
  PORT: number;
  NODE_ENV: string;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRATION: string;
  REFRESH_TOKEN_EXPIRATION: string;
  FRONTEND_URL: string;
  S3_BUCKET: string;
  S3_REGION: string;
  S3_ACCESS_KEY: string;
  S3_SECRET_KEY: string;
  S3_ENDPOINT: string;
  CLOUDFLARE_ZONE: string;
  AUDIT_ENABLED: boolean;
}

@Injectable()
export class ConfigService {
  private readonly config: EnvConfig;

  constructor() {
    // Load .env file manually (simple approach without dotenv dependency)
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      envContent.split('\n').forEach((line) => {
        const [key, ...valueParts] = line.split('=');
        if (key && !key.startsWith('#')) {
          const value = valueParts.join('=').trim();
          process.env[key.trim()] = value;
        }
      });
    }

    this.config = {
      PORT: parseInt(process.env.PORT || '3000', 10),
      NODE_ENV: process.env.NODE_ENV || 'development',
      DATABASE_URL: process.env.DATABASE_URL || '',
      JWT_SECRET: process.env.JWT_SECRET || 'change-this-in-production',
      JWT_EXPIRATION: process.env.JWT_EXPIRATION || '15m',
      REFRESH_TOKEN_EXPIRATION: process.env.REFRESH_TOKEN_EXPIRATION || '7d',
      FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:4200',
      S3_BUCKET: process.env.S3_BUCKET || '',
      S3_REGION: process.env.S3_REGION || 'us-east-1',
      S3_ACCESS_KEY: process.env.S3_ACCESS_KEY || '',
      S3_SECRET_KEY: process.env.S3_SECRET_KEY || '',
      S3_ENDPOINT: process.env.S3_ENDPOINT || '',
      CLOUDFLARE_ZONE: process.env.CLOUDFLARE_ZONE || '',
      AUDIT_ENABLED: process.env.AUDIT_ENABLED !== 'false',
    };
  }

  get(key: keyof EnvConfig): string | number | boolean {
    return this.config[key];
  }

  getPort(): number {
    return this.config.PORT;
  }

  getDatabaseUrl(): string {
    return this.config.DATABASE_URL;
  }

  getJwtSecret(): string {
    return this.config.JWT_SECRET;
  }

  getJwtExpiration(): string {
    return this.config.JWT_EXPIRATION;
  }

  getRefreshTokenExpiration(): string {
    return this.config.REFRESH_TOKEN_EXPIRATION;
  }

  getFrontendUrl(): string {
    return this.config.FRONTEND_URL;
  }

  getNodeEnv(): string {
    return this.config.NODE_ENV;
  }

  isProduction(): boolean {
    return this.config.NODE_ENV === 'production';
  }

  getS3Config(): {
    bucket: string;
    region: string;
    accessKey: string;
    secretKey: string;
    endpoint: string;
  } {
    return {
      bucket: this.config.S3_BUCKET,
      region: this.config.S3_REGION,
      accessKey: this.config.S3_ACCESS_KEY,
      secretKey: this.config.S3_SECRET_KEY,
      endpoint: this.config.S3_ENDPOINT,
    };
  }

  isAuditEnabled(): boolean {
    return this.config.AUDIT_ENABLED;
  }
}
