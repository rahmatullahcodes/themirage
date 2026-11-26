'use client';

export interface ClientSessionUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: 'ADMIN' | 'CREATOR' | 'SUBSCRIBER';
  avatar?: string;
  bio?: string;
  ageVerified?: boolean;
  creatorId?: string;
  creatorHandle?: string;
  monthlyPrice?: number;
}

export function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const token = localStorage.getItem('mirage_token');
    if (token) return { Authorization: `Bearer ${token}` };
  } catch {}
  return {};
}

export function clearClientSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('mirage_token');
    localStorage.removeItem('mirage_user');
    window.dispatchEvent(new Event('mirage_auth_changed'));
  } catch {}
}

/** Verifies the current login session with the backend; clears stale local auth if invalid. */
export async function fetchCurrentSessionUser(): Promise<ClientSessionUser | null> {
  try {
    const res = await fetch('/api/auth/me', {
      headers: getAuthHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) {
      clearClientSession();
      return null;
    }
    const data = await res.json();
    if (!data?.success || !data?.user) {
      clearClientSession();
      return null;
    }
    try {
      localStorage.setItem('mirage_user', JSON.stringify(data.user));
    } catch {}
    return data.user as ClientSessionUser;
  } catch {
    return null;
  }
}

export async function performLogout(redirectFn: (url: string) => void, redirectTo = '/login'): Promise<void> {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch {}
  clearClientSession();
  redirectFn(redirectTo);
}
