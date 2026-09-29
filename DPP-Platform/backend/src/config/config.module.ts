import { Module, Global } from '@nestjs/common';
import { ConfigService } from './configuration.service';

@Global()
@Module({
  providers: [ConfigService],
  exports: [ConfigService],
})
export class AppConfigModule {}
