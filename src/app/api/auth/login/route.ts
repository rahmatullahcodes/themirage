import { NextResponse } from 'next/server';
import { signToken, comparePassword, attachSessionCookie } from '@/lib/auth';
import { findCreatorByUserId, findUserByEmail } from '@/lib/contentStore';

export async function POST(req: Request) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
    }

    const { email, password } = body || {};

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: 'Valid email and password are required' }, { status: 400 });
    }

    const lowerEmail = email.trim().toLowerCase();
    const dbUser = findUserByEmail(lowerEmail);

    if (!dbUser) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    if (dbUser.status === 'SUSPENDED') {
      return NextResponse.json(
        { error: 'This account has been suspended by administration.' },
        { status: 403 }
      );
    }

    if (!dbUser.passwordHash) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const isValid = await comparePassword(password, dbUser.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const creatorProfile = dbUser.role === 'CREATOR' ? findCreatorByUserId(dbUser.id) : undefined;

    const user = {
      id: dbUser.id,
      name: dbUser.name,
      username: dbUser.username,
      email: dbUser.email,
      role: dbUser.role,
      avatar: dbUser.avatar || creatorProfile?.avatar || '',
      banner: dbUser.banner || creatorProfile?.banner || '',
      creatorId: creatorProfile?.id,
      creatorHandle: creatorProfile?.handle,
    };

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      username: user.username,
    });

    const res = NextResponse.json({
      message: 'Logged in successfully',
      token,
      user,
    });
    attachSessionCookie(res, token, req);
    return res;
  } catch {
    return NextResponse.json({ error: 'Login error occurred' }, { status: 500 });
  }
}
