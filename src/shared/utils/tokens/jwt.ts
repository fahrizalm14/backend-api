import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';

import { env } from '@/config/env';
import { AppRole, isAppRole } from '@/shared/auth/roles';

export interface AccessTokenPayload extends JwtPayload {
  sub: string;
  email: string;
  role: AppRole;
  name?: string;
}

export function extractBearerToken(header?: string): string | null {
  if (!header) {
    return null;
  }
  const [scheme, token] = header.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return null;
  }
  return token;
}

export function verifyJwt(token: string): JwtPayload {
  const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  if (!payload.sub || typeof payload.sub !== 'string') {
    throw new Error('Invalid token payload: missing sub');
  }
  if (!payload.email || typeof payload.email !== 'string') {
    throw new Error('Invalid token payload: missing email');
  }
  if (!isAppRole(payload.role)) {
    throw new Error('Invalid token payload: missing role');
  }
  return payload as AccessTokenPayload;
}

export function signAccessToken(payload: {
  sub: string;
  email: string;
  role: AppRole;
  name?: string;
}): string {
  const expiresIn = env.JWT_EXPIRES_IN as SignOptions['expiresIn'];
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn });
}
