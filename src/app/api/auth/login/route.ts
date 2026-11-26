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

    const { email, password } = body || {};

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: 'Valid email and password are required' }, { status: 400 });
    }

    const lowerEmail = email.trim().toLowerCase();

    // Assign demo roles for verified demo accounts; external signups default to SUBSCRIBER
    let role: 'ADMIN' | 'CREATOR' | 'SUBSCRIBER' = 'SUBSCRIBER';
    let name = 'Alex Mercer';
    let username = 'alexmercer';
    let id = 'usr-1';

    if (lowerEmail === 'admin@themirage.vip') {
      role = 'ADMIN';
      name = 'Mirage Admin';
      username = 'admin';
      id = 'admin-1';
    } else if (lowerEmail === 'creator@themirage.vip' || lowerEmail === 'luna@themirage.vip') {
      role = 'CREATOR';
      name = 'Luna Rae';
      username = 'luna-rae';
      id = 'c1';
    } else if (lowerEmail === 'sophie@themirage.vip') {
      role = 'CREATOR';
      name = 'Sophie Lee';
      username = 'sophie-lee';
      id = 'c2';
    } else if (lowerEmail === 'mia@themirage.vip') {
      role = 'CREATOR';
      name = 'Mia Carter';
      username = 'mia-carter';
      id = 'c3';
    } else if (lowerEmail !== 'subscriber@themirage.vip') {
      const localPart = lowerEmail.split('@')[0] || 'member';
      name = localPart.replace(/[._-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      username = localPart.replace(/[^a-z0-9_-]/g, '');
      id = `usr_${Buffer.from(lowerEmail).toString('hex').slice(0, 10)}`;
    }

    const user = {
      id,
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

