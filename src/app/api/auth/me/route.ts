import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { findCreatorByUserId, findUserById } from '@/lib/contentStore';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = getSessionUser(req);
    if (!session) {
      return NextResponse.json(
        { success: false, authenticated: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const dbUser = findUserById(session.userId);
    if (!dbUser || dbUser.status === 'SUSPENDED') {
      return NextResponse.json(
        { success: false, authenticated: false, error: 'Session is invalid or suspended' },
        { status: 401 }
      );
    }

    const creatorProfile = dbUser.role === 'CREATOR' ? findCreatorByUserId(dbUser.id) : undefined;

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        id: dbUser.id,
        name: dbUser.name,
        username: dbUser.username,
        email: dbUser.email,
        role: dbUser.role,
        avatar: dbUser.avatar || creatorProfile?.avatar || '',
        banner: dbUser.banner || creatorProfile?.banner || '',
        bio: dbUser.bio || creatorProfile?.bio || '',
        ageVerified: dbUser.ageVerified,
        creatorId: creatorProfile?.id,
        creatorHandle: creatorProfile?.handle,
        monthlyPrice: creatorProfile?.monthlyPrice,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, authenticated: false, error: 'Failed to verify session' },
      { status: 500 }
    );
  }
}
