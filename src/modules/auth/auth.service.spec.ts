import 'reflect-metadata';
import { strict as assert } from 'node:assert';
import test from 'node:test';

import { AppError } from '@/core/errors/AppError';
import {
  AuthSession,
  AuthUser,
  IAuthRepository,
  SessionMetadata,
} from '@/modules/auth/auth.interface';
import { AuthService } from '@/modules/auth/auth.service';

function createBaseUser(): AuthUser {
  return {
    id: 'u1',
    email: 'user@mail.com',
    role: 'member',
    name: 'User',
    avatarUrl: null,
  };
}

function createSession(overrides: Partial<AuthSession> = {}): AuthSession {
  return {
    id: 's1',
    userId: 'u1',
    refreshTokenHash: 'hash',
    expiresAt: new Date(Date.now() + 86_400_000),
    revokedAt: null,
    replacedBySessionId: null,
    ...overrides,
  };
}

function createRepositoryMock(): IAuthRepository {
  return {
    createWithPassword: async (input) => ({
      ...createBaseUser(),
      email: input.email,
    }),
    findCredentialByEmail: async () => ({
      user: createBaseUser(),
      passwordHash:
        'e2138a4f98d3650664438f7793f14d0e:48976e3f7fb1bdf1f4314166de0741fe5a13f95d431bdf0a6e5f6d20d8ce33746968b9a65216ff9b75b88936cb8d3b90f451f26f95f4f8b39ab3da5d5b745ad0',
    }),
    findOrCreateFromGoogle: async () => createBaseUser(),
    findById: async () => createBaseUser(),
    createSession: async (input) =>
      createSession({
        userId: input.userId,
        refreshTokenHash: input.refreshTokenHash,
        expiresAt: input.expiresAt,
      }),
    findSessionByRefreshTokenHash: async () => null,
    rotateSession: async (input) =>
      createSession({
        id: 's2',
        userId: input.userId,
        refreshTokenHash: input.refreshTokenHash,
        expiresAt: input.expiresAt,
      }),
    revokeSession: async () => {},
    revokeAllSessionsByUserId: async () => {},
  };
}

test('AuthService.registerManual normalizes email and creates refresh session', async () => {
  const repository = createRepositoryMock();
  let capturedEmail = '';
  let metadataCaptured: SessionMetadata | undefined;

  repository.findCredentialByEmail = async () => null;
  repository.createWithPassword = async (input) => {
    capturedEmail = input.email;
    return {
      ...createBaseUser(),
      email: input.email,
    };
  };
  repository.createSession = async (input) => {
    metadataCaptured = input.metadata;
    return createSession({
      userId: input.userId,
      refreshTokenHash: input.refreshTokenHash,
      expiresAt: input.expiresAt,
    });
  };

  const service = new AuthService(repository);
  const result = await service.registerManual({
    email: '  USER@MAIL.COM ',
    password: 'password123',
    metadata: { ipAddress: '127.0.0.1' },
  });

  assert.equal(capturedEmail, 'user@mail.com');
  assert.ok(result.refreshToken.length > 20);
  assert.equal(result.auth.user.email, 'user@mail.com');
  assert.equal(metadataCaptured?.ipAddress, '127.0.0.1');
});

test('AuthService.refreshSession revokes all sessions when refresh token reuse detected', async () => {
  const repository = createRepositoryMock();
  let revokedUserId = '';
  repository.findSessionByRefreshTokenHash = async () =>
    createSession({
      userId: 'u77',
      revokedAt: new Date(),
    });
  repository.revokeAllSessionsByUserId = async (userId) => {
    revokedUserId = userId;
  };

  const service = new AuthService(repository);

  await assert.rejects(
    () => service.refreshSession('reuse-token'),
    (error: unknown) =>
      error instanceof AppError &&
      error.statusCode === 401 &&
      error.message.includes('reuse detected'),
  );
  assert.equal(revokedUserId, 'u77');
});

test('AuthService.logoutAll revokes all user sessions', async () => {
  const repository = createRepositoryMock();
  let revokedUserId = '';
  repository.revokeAllSessionsByUserId = async (userId) => {
    revokedUserId = userId;
  };

  const service = new AuthService(repository);
  await service.logoutAll('u123');

  assert.equal(revokedUserId, 'u123');
});
