import { NextRequest, NextResponse } from 'next/server';
import { getUserFromAuthHeader } from '@/lib/auth';
import { getUserFollows, followCreator, unfollowCreator } from '@/lib/contentStore';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl?.searchParams || new URL(req.url, 'http://localhost:3000').searchParams;
    const tokenUser = getUserFromAuthHeader(req.headers.get('Authorization'));
    const userId = tokenUser?.userId || searchParams.get('userId') || 'usr-1';

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
    const body = await req.json();
    const tokenUser = getUserFromAuthHeader(req.headers.get('Authorization'));
    const { creatorId, handle, userId: bodyUserId } = body || {};
    const userId = tokenUser?.userId || bodyUserId || 'usr-1';
    const target = handle || creatorId;

    if (!target) {
      return NextResponse.json({ success: false, message: 'creatorId or handle required' }, { status: 400 });
    }

    const result = followCreator(userId, target);
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
    const searchParams = req.nextUrl?.searchParams || new URL(req.url, 'http://localhost:3000').searchParams;
    const tokenUser = getUserFromAuthHeader(req.headers.get('Authorization'));
    let body: any = {};
    try {
      body = await req.json();
    } catch {}
    const userId = tokenUser?.userId || body.userId || searchParams.get('userId') || 'usr-1';
    const target = body.handle || body.creatorId || searchParams.get('handle') || searchParams.get('creatorId');

    if (!target) {
      return NextResponse.json({ success: false, message: 'handle or creatorId required' }, { status: 400 });
    }

    const result = unfollowCreator(userId, target);
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
