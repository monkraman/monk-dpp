import { Injectable, CanActivate, ExecutionContext, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRequest } from '../decorators/current-user.decorator';

export const ROLE_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLE_KEY, roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<UserRequest>();
    const user = request.user;

    if (!user) {
      return false;
    }

    // Admins have access to all tenant operations
    if (user.role === 'super_admin' || user.role === 'org_admin' || user.role === 'admin') {
      return true;
    }

    // Direct match
    if (requiredRoles.includes(user.role)) {
      return true;
    }

    // Member aliases
    if (requiredRoles.includes('member') && (user.role === 'product_manager' || user.role === 'compliance')) {
      return true;
    }

    return false;
  }
}
