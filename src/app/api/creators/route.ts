import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { findCreatorByUserId, listAllCreators, updateCreatorProfileSettings, getPublicPlatformStats } from '@/lib/contentStore';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl?.searchParams || new URL(req.url, 'http://localhost:3000').searchParams;
    const category = searchParams.get('category') || undefined;
    const q = searchParams.get('q') || undefined;
    const sort = searchParams.get('sort') || undefined;
    const handle = searchParams.get('handle') || undefined;

    const creators = listAllCreators({ category, q, sort, handle });
    const stats = getPublicPlatformStats();
    return NextResponse.json({
      success: true,
      count: creators.length,
      creators,
      stats,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch creators' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = requireSession(req, ['CREATOR', 'ADMIN']);
    if (!auth.ok) return auth.response;

    const body = await req.json();
    const { creatorId, handle, monthlyPrice, bio, category, name, avatar, banner } = body || {};

    const target =
      auth.user.role === 'CREATOR'
        ? findCreatorByUserId(auth.user.userId)?.id || auth.user.userId
        : handle || creatorId;

    if (!target) {
      return NextResponse.json({ success: false, message: 'creatorId or handle is required' }, { status: 400 });
    }

    const result = updateCreatorProfileSettings(target, { monthlyPrice, bio, category, name, avatar, banner });
    if (!result.success) {
      return NextResponse.json({ success: false, message: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      creator: result.creator,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to update creator settings' },
      { status: 500 }
    );
  }
}
