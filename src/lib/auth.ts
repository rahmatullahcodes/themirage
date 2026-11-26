import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'the_mirage_super_secret_jwt_key_2026_luxury_black_gold';
export const SESSION_COOKIE_NAME = 'mirage_token';
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'VISITOR' | 'SUBSCRIBER' | 'CREATOR' | 'ADMIN';
  username: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function getUserFromAuthHeader(authHeader?: string | null): TokenPayload | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7).trim();
  return token ? verifyToken(token) : null;
}

export function getCookieValue(cookieHeader: string | null | undefined, name: string): string | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(';');
  for (const part of parts) {
    const eqIdx = part.indexOf('=');
    if (eqIdx === -1) continue;
    const key = part.slice(0, eqIdx).trim();
    if (key === name) {
      try {
        return decodeURIComponent(part.slice(eqIdx + 1).trim());
      } catch {
        return part.slice(eqIdx + 1).trim();
      }
    }
  }
  return null;
}

/** Extracts and verifies the active user session from Bearer header or HttpOnly session cookie. */
export function getSessionUser(req: Request): TokenPayload | null {
  const headerUser = getUserFromAuthHeader(req.headers.get('Authorization'));
  if (headerUser) return headerUser;

  const cookieToken = getCookieValue(req.headers.get('cookie'), SESSION_COOKIE_NAME);
  if (!cookieToken) return null;
  return verifyToken(cookieToken);
}

function isHttpsRequest(req: Request): boolean {
  const forwarded = req.headers.get('x-forwarded-proto')?.split(',')[0]?.trim().toLowerCase();
  if (forwarded) return forwarded === 'https';
  return req.url.startsWith('https://');
}

export function attachSessionCookie(res: NextResponse, token: string, req: Request): void {
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
    secure: isHttpsRequest(req),
  });
}

export function clearSessionCookie(res: NextResponse, req: Request): void {
  res.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    secure: isHttpsRequest(req),
  });
}

export function requireSession(
  req: Request,
  allowedRoles?: Array<TokenPayload['role']>
): { ok: true; user: TokenPayload } | { ok: false; response: NextResponse } {
  const user = getSessionUser(req);
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: 'Unauthorized. Please log in.' },
        { status: 401 }
      ),
    };
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: 'Forbidden. You do not have permission for this resource.' },
        { status: 403 }
      ),
    };
  }
  return { ok: true, user };
}
