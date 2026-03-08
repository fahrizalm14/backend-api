import type { AppRole } from '@/shared/auth/roles';

export const AUTH_REPOSITORY_TOKEN = Symbol('AUTH_REPOSITORY_TOKEN');

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: AppRole;
}

export interface GoogleLoginInput {
  idToken: string;
}

export interface AuthTokenResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
  user: AuthUser;
}

export interface AuthSession {
  id: string;
  userId: string;
  refreshTokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  replacedBySessionId: string | null;
}

export interface SessionMetadata {
  userAgent?: string;
  ipAddress?: string;
}

export interface IAuthRepository {
  createWithPassword(input: {
    email: string;
    passwordHash: string;
    name?: string;
  }): Promise<AuthUser>;

  findCredentialByEmail(email: string): Promise<{
    user: AuthUser;
    passwordHash: string | null;
  } | null>;

  findOrCreateFromGoogle(input: {
    googleSub: string;
    email: string;
    name?: string;
    avatarUrl?: string;
  }): Promise<AuthUser>;

  findById(userId: string): Promise<AuthUser | null>;

  createSession(input: {
    userId: string;
    refreshTokenHash: string;
    expiresAt: Date;
    metadata?: SessionMetadata;
  }): Promise<AuthSession>;

  findSessionByRefreshTokenHash(refreshTokenHash: string): Promise<AuthSession | null>;

  rotateSession(input: {
    sessionId: string;
    userId: string;
    refreshTokenHash: string;
    expiresAt: Date;
    metadata?: SessionMetadata;
  }): Promise<AuthSession>;

  revokeSession(sessionId: string): Promise<void>;

  revokeAllSessionsByUserId(userId: string): Promise<void>;
}
