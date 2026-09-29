import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ConfigService } from '../config/configuration.service';

// Entities (empty for now — will be added as we create each module)
// For now we import nothing — migrations will create tables

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'dpp_admin',
        password: 'dpp_password',
        database: 'dpp_platform',
        entities: [],
        synchronize: false, // Use migrations only
        logging: configService.getNodeEnv() === 'development',
        extra: {
          // Connection pool settings
          max: 10,
          idleTimeoutMillis: 30000,
        },
      }),
    }),
  ],
  providers: [],
  exports: [TypeOrmModule],
})
export class DatabaseModule {
  // Helper to get DataSource for migrations
  static dataSource: DataSource;

  constructor(dataSource: DataSource) {
    DatabaseModule.dataSource = dataSource;
  }
}
