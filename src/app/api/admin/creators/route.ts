import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import {
  listAllCreators,
  toggleCreatorVerificationAdmin,
  updateCreatorAdmin,
  deleteCreatorAdmin,
} from '@/lib/contentStore';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = requireSession(req, ['ADMIN']);
    if (!auth.ok) return auth.response;

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
    const auth = requireSession(req, ['ADMIN']);
    if (!auth.ok) return auth.response;

    const body = await req.json();
    const { creatorId, action, name, handle, category, monthlyPrice, bio, isVerified, status } = body || {};

    if (!creatorId) {
      return NextResponse.json({ success: false, message: 'creatorId is required' }, { status: 400 });
    }

    const hasUpdates =
      name !== undefined ||
      handle !== undefined ||
      category !== undefined ||
      monthlyPrice !== undefined ||
      bio !== undefined ||
      isVerified !== undefined ||
      status !== undefined;

    if (hasUpdates && action !== 'TOGGLE_VERIFY') {
      const result = updateCreatorAdmin(creatorId, {
        name,
        handle,
        category,
        monthlyPrice,
        bio,
        isVerified,
        status,
      });
      if (!result.success) {
        return NextResponse.json({ success: false, message: result.error || 'Creator not found' }, { status: 400 });
      }
      return NextResponse.json({ success: true, creator: result.creator });
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
      { success: false, message: error?.message || 'Failed to update creator' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = requireSession(req, ['ADMIN']);
    if (!auth.ok) return auth.response;

    const searchParams = req.nextUrl?.searchParams || new URL(req.url, 'http://localhost:3000').searchParams;
    const creatorId = searchParams.get('creatorId');
    if (!creatorId) {
      return NextResponse.json({ success: false, message: 'creatorId is required' }, { status: 400 });
    }
    const result = deleteCreatorAdmin(creatorId);
    if (!result.success) {
      return NextResponse.json({ success: false, message: result.error || 'Creator not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Creator deleted permanently' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to delete creator' },
      { status: 500 }
    );
  }
}
