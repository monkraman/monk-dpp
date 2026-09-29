import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

// Extend Express Request to include user
export interface UserRequest extends Request {
  user?: {
    sub: string;
    email: string;
    role: string;
    organizationId: string;
    firstName?: string;
    lastName?: string;
  };
}

/**
 * @CurrentUser() decorator — extracts user from request
 * Usage: constructor(@CurrentUser() user: any) {}
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<UserRequest>();
    return request.user;
  },
);
