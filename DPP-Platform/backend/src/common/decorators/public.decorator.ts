import { SetMetadata } from '@nestjs/common';

/**
 * @Public() decorator — marks endpoint as public (no auth required)
 * Usage: @Public() @Get() findAll() {}
 */
export const PUBLIC_KEY = 'public';
export const Public = () => SetMetadata(PUBLIC_KEY, true);
