import { inject, injectable } from 'tsyringe';

import { AppError } from '@/core/errors/AppError';
import { BaseController } from '@/core/http/BaseController';
import { RouteContext, RouteResponse } from '@/core/http/types';
import { AuthService } from '@/modules/auth/auth.service';
import {
  googleLoginSchema,
  loginSchema,
  registerSchema,
} from '@/modules/auth/auth.validation';

@injectable()
export class AuthController extends BaseController {
  constructor(@inject(AuthService) private readonly service: AuthService) {
    super();
  }

  async register(ctx: RouteContext): Promise<RouteResponse> {
    const payload = registerSchema.safeParse(ctx.body);
    if (!payload.success) {
      throw new AppError(400, payload.error.issues[0]?.message ?? 'Invalid payload');
    }

    const result = await this.service.registerManual(payload.data);
    return this.created(result, 'Register successful');
  }

  async login(ctx: RouteContext): Promise<RouteResponse> {
    const payload = loginSchema.safeParse(ctx.body);
    if (!payload.success) {
      throw new AppError(400, payload.error.issues[0]?.message ?? 'Invalid payload');
    }

    const result = await this.service.loginManual(payload.data);
    return this.ok(result, 'Login successful');
  }

  async googleLogin(ctx: RouteContext): Promise<RouteResponse> {
    const payload = googleLoginSchema.safeParse(ctx.body);
    if (!payload.success) {
      throw new AppError(400, payload.error.issues[0]?.message ?? 'Invalid payload');
    }

    const result = await this.service.loginWithGoogle(payload.data.idToken);
    return this.ok(result, 'Login successful');
  }

  async me(ctx: RouteContext): Promise<RouteResponse> {
    const userId = this.requireUserId(ctx);
    const user = await this.service.getMe(userId);
    return this.ok(user, 'Current user retrieved successfully');
  }

  async adminPing(): Promise<RouteResponse> {
    return this.ok({ ok: true }, 'Admin access granted');
  }
}
