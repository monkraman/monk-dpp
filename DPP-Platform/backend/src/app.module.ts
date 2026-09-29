import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { AppConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { DppsModule } from './dpps/dpps.module';
import { DocumentsModule } from './documents/documents.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { TemplatesModule } from './templates/templates.module';
import { AuditModule } from './audit/audit.module';
import { ExportModule } from './export/export.module';

@Module({
  imports: [
    // Config (must be first)
    AppConfigModule,

    // Throttling (rate limiting)
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 10 },
      { name: 'medium', ttl: 60000, limit: 100 },
      { name: 'long', ttl: 3600000, limit: 1000 },
    ]),

    // Database
    DatabaseModule,

    // Feature modules
    AuthModule,
    OrganizationsModule,
    UsersModule,
    ProductsModule,
    DppsModule,
    DocumentsModule,
    SuppliersModule,
    TemplatesModule,
    AuditModule,
    ExportModule,
  ],
})
export class AppModule {}
