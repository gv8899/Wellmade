import { SetMetadata } from '@nestjs/common';

/**
 * Key used to identify public routes that don't require authentication
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator to mark a route as public, bypassing JWT authentication
 * @example
 * @Public()
 * @Get('example')
 * exampleRoute() {
 *   return 'This route is public';
 * }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
