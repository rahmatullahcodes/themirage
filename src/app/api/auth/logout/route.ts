import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth';

export async function POST(req: Request) {
  const res = NextResponse.json({ success: true, message: 'Signed out successfully' });
  clearSessionCookie(res, req);
  return res;
}
