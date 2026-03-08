import { inject, injectable } from 'tsyringe';

import { env } from '@/config/env';
import { AppError } from '@/core/errors/AppError';
import {
  AUTH_REPOSITORY_TOKEN,
  AuthTokenResponse,
  AuthUser,
  IAuthRepository,
} from '@/modules/auth/auth.interface';
import { hashPassword, verifyPassword } from '@/shared/utils/password';
import { verifyGoogleIdToken } from '@/shared/utils/google/verifyGoogleIdToken';
import { signAccessToken } from '@/shared/utils/tokens/jwt';

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
  }): Promise<AuthTokenResponse> {
    const existing = await this.repository.findCredentialByEmail(input.email);
    if (existing?.passwordHash) {
      throw new AppError(409, 'Email already registered');
    }
    if (existing && !existing.passwordHash) {
      throw new AppError(409, 'Email is already registered using Google login');
    }

    const user = await this.repository.createWithPassword({
      email: input.email,
      passwordHash: hashPassword(input.password),
      name: input.name,
    });

    return this.createAuthTokenResponse(user);
  }

  async loginManual(input: {
    email: string;
    password: string;
  }): Promise<AuthTokenResponse> {
    const credential = await this.repository.findCredentialByEmail(input.email);
    if (!credential || !credential.passwordHash) {
      throw new AppError(401, 'Invalid email or password');
    }

    const valid = verifyPassword(input.password, credential.passwordHash);
    if (!valid) {
      throw new AppError(401, 'Invalid email or password');
    }

    return this.createAuthTokenResponse(credential.user);
  }

  async loginWithGoogle(idToken: string): Promise<AuthTokenResponse> {
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
      email: googleIdentity.email,
      name: googleIdentity.name,
      avatarUrl: googleIdentity.picture,
    });

    return this.createAuthTokenResponse(user);
  }

  async getMe(userId: string) {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new AppError(404, 'User not found');
    }
    return user;
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
}
