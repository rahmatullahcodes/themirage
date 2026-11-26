import { NextRequest, NextResponse } from 'next/server';
import { requireSession, hashPassword } from '@/lib/auth';
import {
  listAllCreators,
  registerNewUser,
  toggleCreatorVerificationAdmin,
  updateCreatorAdmin,
  deleteCreatorAdmin,
} from '@/lib/contentStore';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = requireSession(req, ['ADMIN']);
    if (!auth.ok) return auth.response;

    const creators = listAllCreators({ includeSuspended: true });
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

export async function POST(req: NextRequest) {
  try {
    const auth = requireSession(req, ['ADMIN']);
    if (!auth.ok) return auth.response;

    const body = await req.json();
    const {
      name,
      handle,
      email,
      password,
      category,
      monthlyPrice,
      bio,
      avatar,
      banner,
      isVerified,
      status,
    } = body || {};

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and initial password are required' },
        { status: 400 }
      );
    }
    if (String(password).length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(String(password));
    const derivedHandle =
      (handle && String(handle).trim()) ||
      String(name)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') ||
      `creator_${Date.now()}`;

    const result = registerNewUser({
      name: String(name).trim(),
      username: derivedHandle,
      email: String(email).trim().toLowerCase(),
      passwordHash,
      role: 'CREATOR',
      monthlyPrice: Number(monthlyPrice) || 9.99,
      category,
      bio,
      avatar,
      banner,
      isVerified: Boolean(isVerified),
      status: status === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE',
      exactHandle: true,
    });

    if (!result.success || !result.creator) {
      return NextResponse.json(
        { success: false, message: result.error || 'Failed to create creator account' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      creator: result.creator,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to create creator' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = requireSession(req, ['ADMIN']);
    if (!auth.ok) return auth.response;

    const body = await req.json();
    const { creatorId, action, name, handle, category, monthlyPrice, bio, avatar, banner, isVerified, status } = body || {};

    if (!creatorId) {
      return NextResponse.json({ success: false, message: 'creatorId is required' }, { status: 400 });
    }

    const hasUpdates =
      name !== undefined ||
      handle !== undefined ||
      category !== undefined ||
      monthlyPrice !== undefined ||
      bio !== undefined ||
      avatar !== undefined ||
      banner !== undefined ||
      isVerified !== undefined ||
      status !== undefined;

    if (hasUpdates && action !== 'TOGGLE_VERIFY') {
      const result = updateCreatorAdmin(creatorId, {
        name,
        handle,
        category,
        monthlyPrice,
        bio,
        avatar,
        banner,
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
