import { Module } from '@nestjs/common';
import { DppsController } from './dpps.controller';
import { DppsService } from './dpps.service';

@Module({
  controllers: [DppsController],
  providers: [DppsService],
  exports: [DppsService],
})
export class DppsModule {}
