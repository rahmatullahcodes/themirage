import { NextResponse } from 'next/server';
import { signToken } from '@/lib/auth';

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

    const assignedRole = role === 'CREATOR' ? 'CREATOR' : 'SUBSCRIBER';

    const user = {
      id: `usr_${Date.now()}`,
      name: name.trim(),
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      role: assignedRole,
      monthlyPrice: assignedRole === 'CREATOR' ? (Number(monthlyPrice) || 9.99) : undefined,
    };

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role as 'SUBSCRIBER' | 'CREATOR' | 'ADMIN',
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

