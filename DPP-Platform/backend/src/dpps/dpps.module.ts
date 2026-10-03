import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DppsController } from './dpps.controller';
import { DppsService } from './dpps.service';
import { Dpp } from './entities/dpp.entity';
import { Product } from '../products/entities/product.entity';
import { QrGeneratorHelper } from '../common/helpers/qr-generator.helper';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Dpp, Product]),
    AuditModule,
  ],
  controllers: [DppsController],
  providers: [DppsService, QrGeneratorHelper],
  exports: [DppsService, TypeOrmModule],
})
export class DppsModule {}
