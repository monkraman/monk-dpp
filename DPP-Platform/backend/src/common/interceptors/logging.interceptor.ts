import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();
    const { method, originalUrl, body } = request;
    const userAgent = request.get('user-agent') || '';
    const ip = request.ip || request.socket?.remoteAddress;

    const startTime = Date.now();

    this.logger.log(
      `Incoming Request: ${method} ${originalUrl} — IP: ${ip} — User-Agent: ${userAgent}`,
    );

    if (body && Object.keys(body).length > 0 && method !== 'GET') {
      this.logger.debug(`Request Body: ${JSON.stringify(body)}`);
    }

    return next.handle().pipe(
      tap(() => {
        const elapsed = Date.now() - startTime;
        const { statusCode } = response;
        this.logger.log(
          `Outgoing Response: ${method} ${originalUrl} — Status: ${statusCode} — Duration: ${elapsed}ms`,
        );
      }),
    );
  }
}
