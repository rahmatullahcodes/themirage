import { NextRequest, NextResponse } from 'next/server';
import { listAllCreators, toggleCreatorVerificationAdmin } from '@/lib/contentStore';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const creators = listAllCreators();
    return NextResponse.json({
      success: true,
      count: creators.length,
      creators,
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
    const body = await req.json();
    const { creatorId } = body || {};

    if (!creatorId) {
      return NextResponse.json({ success: false, message: 'creatorId is required' }, { status: 400 });
    }

    const result = toggleCreatorVerificationAdmin(creatorId);
    if (!result.success) {
      return NextResponse.json({ success: false, message: 'Creator not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      creator: result.creator,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to toggle creator verification' },
      { status: 500 }
    );
  }
}
