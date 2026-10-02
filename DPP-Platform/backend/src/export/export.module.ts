import { Module } from '@nestjs/common';
import { ExportController } from './export.controller';
import { ExportService } from './export.service';
import { JsonLdBuilderHelper } from '../common/helpers/jsonld-builder.helper';
import { QrGeneratorHelper } from '../common/helpers/qr-generator.helper';

@Module({
  controllers: [ExportController],
  providers: [ExportService, JsonLdBuilderHelper, QrGeneratorHelper],
  exports: [ExportService, JsonLdBuilderHelper, QrGeneratorHelper],
})
export class ExportModule {}
