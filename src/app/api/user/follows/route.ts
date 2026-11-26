import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getUserFollows, followCreator, unfollowCreator } from '@/lib/contentStore';

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

    const follows = getUserFollows(userId);
    return NextResponse.json({
      success: true,
      count: follows.length,
      follows,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch followed creators' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionUser(req);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { creatorId, handle } = body || {};
    const target = handle || creatorId;

    if (!target) {
      return NextResponse.json({ success: false, message: 'creatorId or handle required' }, { status: 400 });
    }

    const result = followCreator(session.userId, target);
    return NextResponse.json({
      success: result.success,
      follow: result.follow,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to follow creator' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = getSessionUser(req);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl?.searchParams || new URL(req.url, 'http://localhost:3000').searchParams;
    let body: any = {};
    try {
      body = await req.json();
    } catch {}
    const target = body.handle || body.creatorId || searchParams.get('handle') || searchParams.get('creatorId');

    if (!target) {
      return NextResponse.json({ success: false, message: 'handle or creatorId required' }, { status: 400 });
    }

    const result = unfollowCreator(session.userId, target);
    return NextResponse.json({
      success: result.success,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to unfollow creator' },
      { status: 500 }
    );
  }
}
