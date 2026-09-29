import { Injectable } from '@nestjs/common';
import { ConfigService } from '../../config/configuration.service';

export interface JsonLdContext {
  '@context': {
    '@version': 1.1;
    '@ vocab': string;
    name?: string;
    description?: string;
    [key: string]: unknown;
  };
}

@Injectable()
export class JsonLdBuilderHelper {
  constructor(private configService: ConfigService) {}

  /**
   * Build JSON-LD for a DPP (Digital Product Passport)
   * Follows GS1 Digital Link and EU DPP standards
   */
  buildDppJsonLd(dppData: Record<string, unknown>, productIdentifier: string): string {
    const jsonLd: Record<string, unknown> = {
      '@context': {
        '@version': 1.1,
        '@vocab': 'https://w3id.org/ppp/',
        name: 'https://schema.org/name',
        description: 'https://schema.org/description',
      },
      '@type': 'DigitalProductPassport',
      '@id': productIdentifier,
      ...dppData,
    };

    return JSON.stringify(jsonLd, null, 2);
  }

  /**
   * Build minimal JSON-LD for public DPP page
   */
  buildPublicDppJsonLd(dppData: Record<string, unknown>, productIdentifier: string): string {
    const publicData: Record<string, unknown> = {};

    // Only include public-facing fields
    const publicFields = [
      'name',
      'description',
      'productCategory',
      'mass',
      'energyCapacity',
      'chemistry',
      'manufactureDate',
      'recyclingInformation',
    ];

    for (const field of publicFields) {
      if (dppData[field] !== undefined) {
        publicData[field] = dppData[field];
      }
    }

    return this.buildDppJsonLd(publicData, productIdentifier);
  }

  /**
   * Validate JSON-LD structure (basic validation)
   */
  isValidJsonLd(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      return parsed && typeof parsed === 'object' && ('@context' in parsed || '@type' in parsed);
    } catch {
      return false;
    }
  }
}
