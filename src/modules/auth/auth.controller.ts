import { inject, injectable } from 'tsyringe';

import { env } from '@/config/env';
import { AppError } from '@/core/errors/AppError';
import { BaseController } from '@/core/http/BaseController';
import { RouteContext, RouteResponse } from '@/core/http/types';
import { AuthService } from '@/modules/auth/auth.service';
import {
  googleLoginSchema,
  loginSchema,
  registerSchema,
} from '@/modules/auth/auth.validation';
import { parseCookieHeader, serializeCookie } from '@/shared/utils/http/cookies';
import { SessionMetadata } from '@/modules/auth/auth.interface';

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

    const result = await this.service.registerManual({
      ...payload.data,
      metadata: this.extractSessionMetadata(ctx),
    });
    return this.createdWithCookie(
      result.auth,
      'Register successful',
      this.buildRefreshCookie(result.refreshToken),
    );
  }

  async login(ctx: RouteContext): Promise<RouteResponse> {
    const payload = loginSchema.safeParse(ctx.body);
    if (!payload.success) {
      throw new AppError(400, payload.error.issues[0]?.message ?? 'Invalid payload');
    }

    const result = await this.service.loginManual({
      ...payload.data,
      metadata: this.extractSessionMetadata(ctx),
    });
    return this.okWithCookie(
      result.auth,
      'Login successful',
      this.buildRefreshCookie(result.refreshToken),
    );
  }

  async googleLogin(ctx: RouteContext): Promise<RouteResponse> {
    const payload = googleLoginSchema.safeParse(ctx.body);
    if (!payload.success) {
      throw new AppError(400, payload.error.issues[0]?.message ?? 'Invalid payload');
    }

    const result = await this.service.loginWithGoogle(
      payload.data.idToken,
      this.extractSessionMetadata(ctx),
    );
    return this.okWithCookie(
      result.auth,
      'Login successful',
      this.buildRefreshCookie(result.refreshToken),
    );
  }

  async refresh(ctx: RouteContext): Promise<RouteResponse> {
    const refreshToken = this.requireRefreshToken(ctx);
    const result = await this.service.refreshSession(
      refreshToken,
      this.extractSessionMetadata(ctx),
    );
    return this.okWithCookie(
      result.auth,
      'Token refreshed successfully',
      this.buildRefreshCookie(result.refreshToken),
    );
  }

  async logout(ctx: RouteContext): Promise<RouteResponse> {
    const refreshToken = this.getRefreshToken(ctx);
    if (refreshToken) {
      await this.service.logoutByRefreshToken(refreshToken);
    }

    return this.okWithCookie(
      true,
      'Logout successful',
      this.buildClearRefreshCookie(),
    );
  }

  async logoutAll(ctx: RouteContext): Promise<RouteResponse> {
    const userId = this.requireUserId(ctx);
    await this.service.logoutAll(userId);
    return this.okWithCookie(
      true,
      'All sessions logged out successfully',
      this.buildClearRefreshCookie(),
    );
  }

  async me(ctx: RouteContext): Promise<RouteResponse> {
    const userId = this.requireUserId(ctx);
    const user = await this.service.getMe(userId);
    return this.ok(user, 'Current user retrieved successfully');
  }

  async adminPing(): Promise<RouteResponse> {
    return this.ok({ ok: true }, 'Admin access granted');
  }

  private okWithCookie<T>(
    data: T,
    message = 'OK',
    cookieHeader?: string,
  ): RouteResponse {
    return this.response(200, data, message, cookieHeader);
  }

  private createdWithCookie<T>(
    data: T,
    message = 'Created',
    cookieHeader?: string,
  ): RouteResponse {
    return this.response(201, data, message, cookieHeader);
  }

  private response<T>(
    statusCode: number,
    data: T,
    message: string,
    cookieHeader?: string,
  ): RouteResponse {
    return {
      status: statusCode,
      body: {
        message,
        data,
      },
      headers: cookieHeader
        ? {
            'Set-Cookie': cookieHeader,
          }
        : undefined,
    };
  }

  private extractSessionMetadata(ctx: RouteContext): SessionMetadata {
    const headers = ctx.raw.headers as Record<string, string | string[] | undefined>;
    return {
      userAgent: this.getFirstHeaderValue(headers['user-agent']),
      ipAddress: this.resolveIpAddress(ctx, headers),
    };
  }

  private resolveIpAddress(
    ctx: RouteContext,
    headers: Record<string, string | string[] | undefined>,
  ): string | undefined {
    const forwarded = this.getFirstHeaderValue(headers['x-forwarded-for']);
    if (forwarded) {
      return forwarded.split(',')[0]?.trim();
    }

    if (ctx.framework === 'express') {
      return ctx.raw.ip;
    }

    return ctx.raw.ip;
  }

  private requireRefreshToken(ctx: RouteContext): string {
    const token = this.getRefreshToken(ctx);
    if (!token) {
      throw new AppError(401, 'Refresh token not found');
    }

    return token;
  }

  private getRefreshToken(ctx: RouteContext): string | undefined {
    const headers = ctx.raw.headers as Record<string, string | string[] | undefined>;
    const cookieHeader = this.getFirstHeaderValue(headers.cookie);
    const cookies = parseCookieHeader(cookieHeader);
    return cookies[env.REFRESH_TOKEN_COOKIE_NAME];
  }

  private buildRefreshCookie(refreshToken: string): string {
    return serializeCookie(env.REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      path: '/',
      maxAge: env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60,
    });
  }

  private buildClearRefreshCookie(): string {
    return serializeCookie(env.REFRESH_TOKEN_COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      path: '/',
      maxAge: 0,
    });
  }

  private getFirstHeaderValue(
    value: string | string[] | undefined,
  ): string | undefined {
    return Array.isArray(value) ? value[0] : value;
  }
}
