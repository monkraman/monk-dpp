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
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.getDatabaseUrl() || 'postgresql://dpp_admin:dpp_password@localhost:5432/dpp_platform',
        entities: ALL_ENTITIES,
        synchronize: configService.getNodeEnv() === 'development', // Auto create / update tables in development
        logging: configService.getNodeEnv() === 'development',
        extra: {
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
  static dataSource: DataSource;

  constructor(dataSource: DataSource) {
    DatabaseModule.dataSource = dataSource;
  }
}
