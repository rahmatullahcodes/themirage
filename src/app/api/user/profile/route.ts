import { NextRequest, NextResponse } from 'next/server';
import { getUserFromAuthHeader } from '@/lib/auth';
import { findUserById, updateUserProfile } from '@/lib/contentStore';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl?.searchParams || new URL(req.url, 'http://localhost:3000').searchParams;
    const tokenUser = getUserFromAuthHeader(req.headers.get('Authorization'));
    const userId = tokenUser?.userId || searchParams.get('userId') || 'usr-1';

    const user = findUserById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        bio: user.bio || '',
        ageVerified: user.ageVerified,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const tokenUser = getUserFromAuthHeader(req.headers.get('Authorization'));
    const { userId: bodyUserId, name, bio } = body || {};
    const userId = tokenUser?.userId || bodyUserId;

    if (!userId) {
      return NextResponse.json({ success: false, message: 'userId is required' }, { status: 400 });
    }

    const result = updateUserProfile(userId, { name, bio });
    if (!result.success || !result.user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        name: result.user.name,
        username: result.user.username,
        email: result.user.email,
        role: result.user.role,
        bio: result.user.bio || '',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}
