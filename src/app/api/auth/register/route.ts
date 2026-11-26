import { NextResponse } from 'next/server';
import { signToken, hashPassword } from '@/lib/auth';
import { registerNewUser } from '@/lib/contentStore';

export async function POST(req: Request) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
    }

    const { name, username, email, password, role, monthlyPrice } = body || {};

    if (
      !name ||
      !username ||
      !email ||
      !password ||
      typeof name !== 'string' ||
      typeof username !== 'string' ||
      typeof email !== 'string' ||
      typeof password !== 'string'
    ) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const assignedRole = role === 'CREATOR' ? 'CREATOR' : 'SUBSCRIBER';

    const regResult = registerNewUser({
      name,
      username,
      email,
      passwordHash,
      role: assignedRole,
      monthlyPrice: assignedRole === 'CREATOR' ? (Number(monthlyPrice) || 9.99) : undefined,
    });

    if (!regResult.success || !regResult.user) {
      return NextResponse.json(
        { error: regResult.error || 'Registration failed' },
        { status: 400 }
      );
    }

    const user = {
      id: regResult.user.id,
      name: regResult.user.name,
      username: regResult.user.username,
      email: regResult.user.email,
      role: regResult.user.role,
      avatar: regResult.user.avatar || regResult.creator?.avatar || '',
      monthlyPrice: regResult.creator?.monthlyPrice,
    };

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      username: user.username,
    });

    return NextResponse.json({
      message: 'Account created successfully',
      token,
      user,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to register account' }, { status: 500 });
  }
}
