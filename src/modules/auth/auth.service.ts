import { inject, injectable } from 'tsyringe';

import { env } from '@/config/env';
import { AppError } from '@/core/errors/AppError';
import {
  AUTH_REPOSITORY_TOKEN,
  AuthTokenResponse,
  IAuthRepository,
} from '@/modules/auth/auth.interface';
import { verifyGoogleIdToken } from '@/shared/utils/google/verifyGoogleIdToken';
import { signAccessToken } from '@/shared/utils/tokens/jwt';

@injectable()
export class AuthService {
  constructor(
    @inject(AUTH_REPOSITORY_TOKEN)
    private readonly repository: IAuthRepository,
  ) {}

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
      user,
    };
  }

  async getMe(userId: string) {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new AppError(404, 'User not found');
    }
    return user;
  }
}
