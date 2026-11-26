import { NextResponse } from 'next/server';
import { signToken, comparePassword } from '@/lib/auth';
import { findUserByEmail, registerNewUser } from '@/lib/contentStore';

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
    let dbUser = findUserByEmail(lowerEmail);

    if (dbUser) {
      if (dbUser.status === 'SUSPENDED') {
        return NextResponse.json(
          { error: 'This account has been suspended by administration.' },
          { status: 403 }
        );
      }
      // Verify hashed password if the account was registered with a password
      if (dbUser.passwordHash) {
        const isValid = await comparePassword(password, dbUser.passwordHash);
        if (!isValid) {
          return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }
      }
    } else {
      // Auto-provision subscriber record on demo/test login so user appears in Admin User Accounts
      const localPart = lowerEmail.split('@')[0] || 'member';
      const displayName = localPart.replace(/[._-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      const cleanUsername = localPart.replace(/[^a-z0-9_-]/g, '') || `user_${Date.now()}`;
      const reg = registerNewUser({
        name: displayName,
        username: cleanUsername,
        email: lowerEmail,
        role: 'SUBSCRIBER',
      });
      if (!reg.success || !reg.user) {
        return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
      }
      dbUser = reg.user;
    }

    const user = {
      id: dbUser.id,
      name: dbUser.name,
      username: dbUser.username,
      email: dbUser.email,
      role: dbUser.role,
    };

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      username: user.username,
    });

    return NextResponse.json({
      message: 'Logged in successfully',
      token,
      user,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Login error occurred' }, { status: 500 });
  }
}
