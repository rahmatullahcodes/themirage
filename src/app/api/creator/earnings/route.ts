import { NextRequest, NextResponse } from 'next/server';
import { getCreatorSegregatedEarnings } from '@/lib/contentStore';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const creatorId = url.searchParams.get('creatorId') || 'c1';

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

