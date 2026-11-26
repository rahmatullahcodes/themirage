import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { findCreatorByUserId, getCreatorSegregatedEarnings, resolveCreatorId } from '@/lib/contentStore';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = requireSession(req, ['CREATOR', 'ADMIN']);
    if (!auth.ok) return auth.response;

    const searchParams = req.nextUrl?.searchParams || (req.url.startsWith('http') ? new URL(req.url).searchParams : new URL(req.url, 'http://localhost:3000').searchParams);
    let creatorId: string;

    if (auth.user.role === 'CREATOR') {
      const ownCreator = findCreatorByUserId(auth.user.userId);
      creatorId = ownCreator?.id || resolveCreatorId(auth.user.userId);
    } else {
      const rawCreatorId = searchParams.get('creatorId') || 'c1';
      creatorId = resolveCreatorId(rawCreatorId) || 'c1';
    }

    const earnings = getCreatorSegregatedEarnings(creatorId);

    return NextResponse.json({
      success: true,
      earnings,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch creator earnings' },
      { status: 500 }
    );
  }
}
