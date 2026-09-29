import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Transforms the response data:
 * - Removes undefined values
 * - Ensures consistent response format
 */
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data) => {
        // If data is already in our standard response format, return as-is
        if (data && typeof data === 'object' && ('statusCode' in data || 'data' in data)) {
          return data;
        }

        // Otherwise wrap in standard format
        return {
          statusCode: context.switchToHttp().getResponse().statusCode,
          data,
          message: 'Success',
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
