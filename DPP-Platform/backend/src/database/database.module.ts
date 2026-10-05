import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ConfigService } from '../config/configuration.service';
import { ALL_ENTITIES } from './entities.index';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbUrl = configService.getDatabaseUrl() || '';
        const isRemoteDb =
          dbUrl.includes('render.com') ||
          dbUrl.includes('supabase') ||
          dbUrl.includes('neon.tech') ||
          dbUrl.includes('sslmode=require') ||
          process.env.DB_SSL === 'true';

        return {
          type: 'postgres',
          url: dbUrl || 'postgresql://dpp_admin:dpp_password@localhost:5432/dpp_platform',
          entities: ALL_ENTITIES,
          synchronize:
            process.env.DB_SYNCHRONIZE === 'true' ||
            configService.getNodeEnv() === 'development',
          ssl: isRemoteDb ? { rejectUnauthorized: false } : false,
          logging: configService.getNodeEnv() === 'development',
          extra: {
            max: 10,
            idleTimeoutMillis: 30000,
          },
        };
      },
    }),
  ],
  providers: [],
  exports: [TypeOrmModule],
})
export class DatabaseModule {
  static dataSource: DataSource;

  constructor(dataSource: DataSource) {
    DatabaseModule.dataSource = dataSource;
  }
}
