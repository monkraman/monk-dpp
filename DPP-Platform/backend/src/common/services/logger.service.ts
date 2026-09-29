import { Injectable, LoggerService as ILoggerService } from '@nestjs/common';
import { ConfigService } from '../../config/configuration.service';

@Injectable()
export class LoggerService implements ILoggerService {
  private readonly isDev: boolean;

  constructor(private configService: ConfigService) {
    this.isDev = configService.getNodeEnv() === 'development';
  }

  log(message: string, context?: string): void {
    this.write('log', message, context);
  }

  error(message: string, trace?: string, context?: string): void {
    this.write('error', message, context, trace);
  }

  warn(message: string, context?: string): void {
    this.write('warn', message, context);
  }

  debug(message: string, context?: string): void {
    if (this.isDev) {
      this.write('debug', message, context);
    }
  }

  verbose(message: string, context?: string): void {
    if (this.isDev) {
      this.write('verbose', message, context);
    }
  }

  private write(level: 'log' | 'error' | 'warn' | 'debug' | 'verbose', message: string, context?: string, trace?: string): void {
    const timestamp = new Date().toISOString();
    const contextStr = context ? `[${context}]` : '';
    const traceStr = trace ? `\n${trace}` : '';

    const logLine = `${timestamp} [${level.toUpperCase()}] ${contextStr} ${message}${traceStr}`;

    switch (level) {
      case 'error':
        console.error(logLine);
        break;
      case 'warn':
        console.warn(logLine);
        break;
      case 'debug':
      case 'verbose':
        if (this.isDev) {
          console.log(logLine);
        }
        break;
      default:
        console.log(logLine);
    }
  }
}
