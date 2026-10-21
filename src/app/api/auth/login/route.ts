import { NextResponse } from 'next/server';
import { signToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const lowerEmail = email.toLowerCase();

    // Check for demo or test accounts
    let role: 'ADMIN' | 'CREATOR' | 'SUBSCRIBER' = 'SUBSCRIBER';
    let name = 'Fan User';
    let username = 'fanuser';

    if (lowerEmail.includes('admin')) {
      role = 'ADMIN';
      name = 'Mirage Admin';
      username = 'admin';
    } else if (lowerEmail.includes('creator') || lowerEmail.includes('luna') || lowerEmail.includes('mia')) {
      role = 'CREATOR';
      name = 'Luna Rae';
      username = 'luna-rae';
    }

    const user = {
      id: `usr_${Date.now()}`,
      name,
      username,
      email: lowerEmail,
      role,
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

