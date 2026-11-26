import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { findCreatorByUserId, findUserById, updateUserProfile } from '@/lib/contentStore';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionUser(req);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl?.searchParams || new URL(req.url, 'http://localhost:3000').searchParams;
    const requestedId = searchParams.get('userId');
    const userId = session.role === 'ADMIN' && requestedId ? requestedId : session.userId;

    const user = findUserById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const creatorProfile = user.role === 'CREATOR' ? findCreatorByUserId(user.id) : undefined;

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar || creatorProfile?.avatar || '',
        bio: user.bio || '',
        ageVerified: user.ageVerified,
        creatorId: creatorProfile?.id,
        creatorHandle: creatorProfile?.handle,
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
    const session = getSessionUser(req);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, username, bio, avatar } = body || {};

    const result = updateUserProfile(session.userId, { name, username, bio, avatar });
    if (!result.success || !result.user) {
      return NextResponse.json({ success: false, message: result.error || 'User not found' }, { status: 404 });
    }

    const creatorProfile = result.user.role === 'CREATOR' ? findCreatorByUserId(result.user.id) : undefined;

    return NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        name: result.user.name,
        username: result.user.username,
        email: result.user.email,
        role: result.user.role,
        avatar: result.user.avatar || creatorProfile?.avatar || '',
        bio: result.user.bio || '',
        ageVerified: result.user.ageVerified,
        creatorId: creatorProfile?.id,
        creatorHandle: creatorProfile?.handle,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}
