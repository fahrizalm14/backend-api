import { env } from '@/config/env';

export interface GoogleIdentity {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
}

interface GoogleTokenInfoResponse {
  aud?: string;
  sub?: string;
  email?: string;
  email_verified?: string | boolean;
  name?: string;
  picture?: string;
  iss?: string;
}

const GOOGLE_ISSUERS = new Set(['accounts.google.com', 'https://accounts.google.com']);
const GOOGLE_TOKENINFO_TIMEOUT_MS = 3_000;

export async function verifyGoogleIdToken(idToken: string): Promise<GoogleIdentity> {
  const endpoint = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`;
  const abortController = new AbortController();
  const timeout = setTimeout(() => {
    abortController.abort();
  }, GOOGLE_TOKENINFO_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(endpoint, { signal: abortController.signal });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Google token verification timeout');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error('Invalid Google token');
  }

  const data = (await response.json()) as GoogleTokenInfoResponse;
  if (!data.sub || !data.email) {
    throw new Error('Invalid Google token payload');
  }

  if (!data.aud || data.aud !== env.GOOGLE_CLIENT_ID) {
    throw new Error('Google token audience mismatch');
  }

  if (!data.iss || !GOOGLE_ISSUERS.has(data.iss)) {
    throw new Error('Google token issuer mismatch');
  }

  const emailVerified = data.email_verified === true || data.email_verified === 'true';
  if (!emailVerified) {
    throw new Error('Google email is not verified');
  }

  return {
    sub: data.sub,
    email: data.email,
    name: data.name,
    picture: data.picture,
  };
}
