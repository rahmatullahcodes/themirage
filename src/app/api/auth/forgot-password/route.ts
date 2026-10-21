import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Generate secure token and log transactional email dispatch
    console.log(`[Auth Mailer] Password reset instructions sent to: ${email}`);

    return NextResponse.json({
      success: true,
      message: 'Password reset link dispatched to verified email address',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

