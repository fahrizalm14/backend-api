import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const SALT_BYTES = 16;
const KEY_LEN = 64;
const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const hash = (await scryptAsync(password, salt, KEY_LEN)) as Buffer;
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}

export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  const [saltHex, hashHex] = storedHash.split(':');
  if (!saltHex || !hashHex) {
    return false;
  }

  if (!isHexString(saltHex) || !isHexString(hashHex)) {
    return false;
  }

  const salt = Buffer.from(saltHex, 'hex');
  const expectedHash = Buffer.from(hashHex, 'hex');
  const passwordHash = (await scryptAsync(password, salt, expectedHash.length)) as Buffer;

  if (passwordHash.length !== expectedHash.length) {
    return false;
  }

  return timingSafeEqual(passwordHash, expectedHash);
}

function isHexString(value: string): boolean {
  return value.length % 2 === 0 && /^[a-f0-9]+$/i.test(value);
}
