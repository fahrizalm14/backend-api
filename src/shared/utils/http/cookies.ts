export function parseCookieHeader(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) {
    return {};
  }

  const entries = cookieHeader.split(';');
  const cookies: Record<string, string> = {};
  for (const entry of entries) {
    const [key, ...valueParts] = entry.trim().split('=');
    if (!key || valueParts.length === 0) {
      continue;
    }
    cookies[key] = decodeURIComponent(valueParts.join('='));
  }

  return cookies;
}

interface SerializeCookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
  path?: string;
  maxAge?: number;
}

export function serializeCookie(
  name: string,
  value: string,
  options: SerializeCookieOptions = {},
): string {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  if (options.path) {
    parts.push(`Path=${options.path}`);
  }
  if (typeof options.maxAge === 'number') {
    parts.push(`Max-Age=${Math.max(0, Math.floor(options.maxAge))}`);
  }
  if (options.httpOnly) {
    parts.push('HttpOnly');
  }
  if (options.secure) {
    parts.push('Secure');
  }
  if (options.sameSite) {
    parts.push(`SameSite=${options.sameSite}`);
  }

  return parts.join('; ');
}
