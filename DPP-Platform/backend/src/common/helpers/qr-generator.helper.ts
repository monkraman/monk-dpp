import { Injectable } from '@nestjs/common';
import * as qrcode from 'qrcode';
import { ConfigService } from '../../config/configuration.service';

@Injectable()
export class QrGeneratorHelper {
  constructor(private configService: ConfigService) {}

  /**
   * Generate QR code as data URL (base64 PNG)
   * For frontend display
   */
  async generateQrDataUrl(data: string): Promise<string> {
    try {
      return await qrcode.toDataURL(data, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });
    } catch (error) {
      console.error('QR generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate QR code as buffer (for storage/saving)
   */
  async generateQrBuffer(data: string): Promise<Buffer> {
    return await qrcode.toBuffer(data, {
      errorCorrectionLevel: 'M',
      type: 'png',
      width: 300,
      margin: 2,
    });
  }

  /**
   * Generate GS1 Digital Link URI for a product
   */
  buildDigitalLink(productId: string, gtin?: string, serial?: string): string {
    const baseUrl = this.configService.getFrontendUrl();
    // Format: https://domain/id/{gtin}/{serial} or https://domain/dpp/{productId}
    if (gtin && serial) {
      return `${baseUrl}/public/dpp/gtin/${encodeURIComponent(gtin)}/serial/${encodeURIComponent(serial)}`;
    }
    return `${baseUrl}/public/dpp/${productId}`;
  }
}
