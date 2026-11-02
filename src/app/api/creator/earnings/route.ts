import { NextRequest, NextResponse } from 'next/server';
import { getCreatorSegregatedEarnings } from '@/lib/contentStore';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl?.searchParams || (req.url.startsWith('http') ? new URL(req.url).searchParams : new URL(req.url, 'http://localhost:3000').searchParams);
    const creatorId = searchParams.get('creatorId') || 'c1';

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

