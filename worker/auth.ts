import type { CloudflareEnv } from './env.ts';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const PBKDF2_ITERATIONS = 100_000;
const AUTH_COOKIE_NAME = 'trusted_admin_token';
const AUTH_SECRET_KV_KEY = 'system:auth_secret';
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(input: string): Uint8Array {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((input.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function timingSafeEqualBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

export function timingSafeEqualStrings(a: string, b: string): boolean {
  return timingSafeEqualBytes(encoder.encode(a), encoder.encode(b));
}

/**
 * Hash a password using PBKDF2-SHA256 (Web Crypto API, Cloudflare Workers compatible).
 * Format: pbkdf2_sha256$<iterations>$<saltBase64Url>$<derivedKeyBase64Url>
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  return `pbkdf2_sha256$${PBKDF2_ITERATIONS}$${toBase64Url(salt)}$${toBase64Url(new Uint8Array(derivedBits))}`;
}

/**
 * Verify a plaintext password against either a PBKDF2-SHA256 hash or a plaintext secret.
 */
export async function verifyPassword(password: string, storedValue: string): Promise<boolean> {
  if (!password || !storedValue) return false;

  if (storedValue.startsWith('pbkdf2_sha256$')) {
    const parts = storedValue.split('$');
    if (parts.length !== 4) return false;
    const iterations = Number(parts[1]);
    if (!Number.isFinite(iterations) || iterations < 10_000 || iterations > 100_000) {
      return false;
    }

    try {
      const salt = fromBase64Url(parts[2]);
      const expectedHash = fromBase64Url(parts[3]);
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits']
      );

      const saltBuffer = new Uint8Array(salt).buffer;
      const derivedBits = await crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt: saltBuffer,
          iterations,
          hash: 'SHA-256',
        },
        keyMaterial,
        expectedHash.length * 8
      );

      return timingSafeEqualBytes(new Uint8Array(derivedBits), expectedHash);
    } catch {
      return false;
    }
  }

  // Constant-time fallback when ADMIN_PASSWORD secret is provided in plaintext
  const hashA = new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(password)));
  const hashB = new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(storedValue)));
  return timingSafeEqualBytes(hashA, hashB);
}

/**
 * Resolve the HMAC signing secret from Cloudflare Secrets or KV-backed generated secret.
 */
export async function resolveAuthSecret(env: CloudflareEnv): Promise<string> {
  if (env.AUTH_SECRET && env.AUTH_SECRET.trim().length >= 16) {
    return env.AUTH_SECRET.trim();
  }

  if (env.CMS_KV) {
    const existing = await env.CMS_KV.get(AUTH_SECRET_KV_KEY);
    if (existing && existing.length >= 32) {
      return existing;
    }
    const generatedBytes = crypto.getRandomValues(new Uint8Array(32));
    const generated = toBase64Url(generatedBytes);
    await env.CMS_KV.put(AUTH_SECRET_KV_KEY, generated);
    return generated;
  }

  throw new Error('AUTH_SECRET is not configured and CMS_KV binding is unavailable.');
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function signAuthToken(email: string, secret: string): Promise<string> {
  const payloadObj = {
    email,
    iat: Date.now(),
    exp: Date.now() + TOKEN_TTL_MS,
  };
  const payload = toBase64Url(encoder.encode(JSON.stringify(payloadObj)));
  const key = await importHmacKey(secret);
  const sigBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  const sig = toBase64Url(new Uint8Array(sigBuffer));
  return `${payload}.${sig}`;
}

export async function verifyAuthToken(
  token: string | undefined,
  secret: string
): Promise<{ email: string } | null> {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  if (!payload || !sig) return null;

  try {
    const key = await importHmacKey(secret);
    const sigBytes = fromBase64Url(sig);
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      new Uint8Array(sigBytes).buffer,
      encoder.encode(payload)
    );
    if (!valid) return null;

    const decoded = JSON.parse(decoder.decode(fromBase64Url(payload))) as {
      email?: string;
      exp?: number;
    };
    if (!decoded.email || !decoded.exp || decoded.exp < Date.now()) {
      return null;
    }
    return { email: decoded.email };
  } catch {
    return null;
  }
}

export function extractTokenFromRequest(request: Request): string | undefined {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }

  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return undefined;

  const cookies = cookieHeader.split(';');
  for (const item of cookies) {
    const eqIndex = item.indexOf('=');
    if (eqIndex === -1) continue;
    const key = item.slice(0, eqIndex).trim();
    const val = item.slice(eqIndex + 1).trim();
    if (key === AUTH_COOKIE_NAME) {
      try {
        return decodeURIComponent(val);
      } catch {
        return val;
      }
    }
  }
  return undefined;
}

export function extractCloudflareAccessEmail(request: Request, env: CloudflareEnv): string | null {
  if (env.ALLOW_CF_ACCESS !== 'true') return null;
  const cfEmail = request.headers.get('cf-access-authenticated-user-email');
  const cfJwt = request.headers.get('cf-access-jwt-assertion');
  if (!cfEmail || !cfJwt) return null;

  const expectedAdmin = getAdminEmail(env);
  const normalized = cfEmail.trim().toLowerCase();
  if (normalized === expectedAdmin) {
    return normalized;
  }
  return null;
}

export function getAdminEmail(env: CloudflareEnv): string {
  return (env.ADMIN_EMAIL || 'hawasbrothers@gmail.com').trim().toLowerCase();
}

export function buildSessionCookie(token: string, requestUrl: URL): string {
  const isHttps = requestUrl.protocol === 'https:';
  const parts = [
    `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=604800',
  ];
  if (isHttps) {
    parts.push('Secure');
  }
  return parts.join('; ');
}

export function buildLogoutCookie(requestUrl: URL): string {
  const isHttps = requestUrl.protocol === 'https:';
  const parts = [
    `${AUTH_COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
  ];
  if (isHttps) {
    parts.push('Secure');
  }
  return parts.join('; ');
}
