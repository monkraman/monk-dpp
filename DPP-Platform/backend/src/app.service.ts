import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth(): Record<string, string> {
    return { status: 'ok', service: 'dpp-platform-backend', version: '1.0.0' };
  }
}
