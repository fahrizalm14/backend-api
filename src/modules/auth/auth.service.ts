import { inject, injectable } from 'tsyringe';

import { env } from '@/config/env';
import { AppError } from '@/core/errors/AppError';
import {
  AUTH_REPOSITORY_TOKEN,
  AuthTokenResponse,
  AuthUser,
  IAuthRepository,
  SessionMetadata,
} from '@/modules/auth/auth.interface';
import { normalizeEmail } from '@/shared/utils/email';
import { hashPassword, verifyPassword } from '@/shared/utils/password';
import { verifyGoogleIdToken } from '@/shared/utils/google/verifyGoogleIdToken';
import {
  generateRefreshToken,
  hashRefreshToken,
} from '@/shared/utils/tokens/refreshToken';
import { signAccessToken } from '@/shared/utils/tokens/jwt';

export interface AuthLoginResult {
  auth: AuthTokenResponse;
  refreshToken: string;
}

@injectable()
export class AuthService {
  constructor(
    @inject(AUTH_REPOSITORY_TOKEN)
    private readonly repository: IAuthRepository,
  ) {}

  async registerManual(input: {
    email: string;
    password: string;
    name?: string;
    metadata?: SessionMetadata;
  }): Promise<AuthLoginResult> {
    const email = normalizeEmail(input.email);
    const existing = await this.repository.findCredentialByEmail(email);
    if (existing?.passwordHash) {
      throw new AppError(409, 'Email already registered');
    }
    if (existing && !existing.passwordHash) {
      throw new AppError(409, 'Email is already registered using Google login');
    }

    const user = await this.repository.createWithPassword({
      email,
      passwordHash: await hashPassword(input.password),
      name: input.name,
    });

    return this.createSessionAuthResponse(user, input.metadata);
  }

  async loginManual(input: {
    email: string;
    password: string;
    metadata?: SessionMetadata;
  }): Promise<AuthLoginResult> {
    const email = normalizeEmail(input.email);
    const credential = await this.repository.findCredentialByEmail(email);
    if (!credential || !credential.passwordHash) {
      throw new AppError(401, 'Invalid email or password');
    }

    const valid = await verifyPassword(input.password, credential.passwordHash);
    if (!valid) {
      throw new AppError(401, 'Invalid email or password');
    }

    return this.createSessionAuthResponse(credential.user, input.metadata);
  }

  async loginWithGoogle(
    idToken: string,
    metadata?: SessionMetadata,
  ): Promise<AuthLoginResult> {
    if (!env.GOOGLE_CLIENT_ID) {
      throw new AppError(500, 'GOOGLE_CLIENT_ID is not configured');
    }

    let googleIdentity;
    try {
      googleIdentity = await verifyGoogleIdToken(idToken);
    } catch {
      throw new AppError(401, 'Invalid Google token');
    }

    const user = await this.repository.findOrCreateFromGoogle({
      googleSub: googleIdentity.sub,
      email: normalizeEmail(googleIdentity.email),
      name: googleIdentity.name,
      avatarUrl: googleIdentity.picture,
    });

    return this.createSessionAuthResponse(user, metadata);
  }

  async getMe(userId: string) {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new AppError(404, 'User not found');
    }
    return user;
  }

  async refreshSession(
    refreshToken: string,
    metadata?: SessionMetadata,
  ): Promise<AuthLoginResult> {
    const tokenHash = hashRefreshToken(refreshToken);
    const currentSession = await this.repository.findSessionByRefreshTokenHash(tokenHash);
    if (!currentSession) {
      throw new AppError(401, 'Invalid refresh token');
    }

    if (currentSession.revokedAt) {
      await this.repository.revokeAllSessionsByUserId(currentSession.userId);
      throw new AppError(401, 'Refresh token reuse detected. Please login again.');
    }

    if (currentSession.expiresAt.getTime() <= Date.now()) {
      await this.repository.revokeSession(currentSession.id);
      throw new AppError(401, 'Refresh token expired');
    }

    const user = await this.repository.findById(currentSession.userId);
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const nextRefreshToken = generateRefreshToken();
    const nextTokenHash = hashRefreshToken(nextRefreshToken);
    const nextExpiresAt = this.buildRefreshTokenExpiration();

    await this.repository.rotateSession({
      sessionId: currentSession.id,
      userId: user.id,
      refreshTokenHash: nextTokenHash,
      expiresAt: nextExpiresAt,
      metadata,
    });

    return {
      auth: this.createAuthTokenResponse(user),
      refreshToken: nextRefreshToken,
    };
  }

  async logoutByRefreshToken(refreshToken: string): Promise<void> {
    const tokenHash = hashRefreshToken(refreshToken);
    const currentSession = await this.repository.findSessionByRefreshTokenHash(tokenHash);
    if (!currentSession) {
      return;
    }

    await this.repository.revokeSession(currentSession.id);
  }

  async logoutAll(userId: string): Promise<void> {
    await this.repository.revokeAllSessionsByUserId(userId);
  }

  private createAuthTokenResponse(user: AuthUser): AuthTokenResponse {
    const accessToken = signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name ?? undefined,
    });

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: env.JWT_EXPIRES_IN,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  private async createSessionAuthResponse(
    user: AuthUser,
    metadata?: SessionMetadata,
  ): Promise<AuthLoginResult> {
    const refreshToken = generateRefreshToken();
    const refreshTokenHash = hashRefreshToken(refreshToken);
    const expiresAt = this.buildRefreshTokenExpiration();

    await this.repository.createSession({
      userId: user.id,
      refreshTokenHash,
      expiresAt,
      metadata,
    });

    return {
      auth: this.createAuthTokenResponse(user),
      refreshToken,
    };
  }

  private buildRefreshTokenExpiration(): Date {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + env.REFRESH_TOKEN_TTL_DAYS);
    return expiresAt;
  }
}
