import { AppError } from '@/core/errors/AppError';
import { createRouteResponse } from '@/core/http/response';
import { RouteContext, RouteResponse } from '@/core/http/types';

export abstract class BaseController {
  protected ok<T>(data: T, message = 'OK'): RouteResponse {
    return createRouteResponse({ data, message, statusCode: 200 });
  }

  protected created<T>(data: T, message = 'Created'): RouteResponse {
    return createRouteResponse({ data, message, statusCode: 201 });
  }

  protected requireUserId(ctx: RouteContext): string {
    const userId = ctx.auth?.sub;
    if (!userId || typeof userId !== 'string') {
      throw new AppError(401, 'Invalid or expired token');
    }
    return userId;
  }
}
