import { NextResponse } from 'next/server';
import { signToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, username, email, password, role, monthlyPrice } = body;

    if (!name || !username || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const assignedRole = role === 'CREATOR' ? 'CREATOR' : 'SUBSCRIBER';

    const user = {
      id: `usr_${Date.now()}`,
      name,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      role: assignedRole,
      monthlyPrice: assignedRole === 'CREATOR' ? (monthlyPrice || 9.99) : undefined,
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

