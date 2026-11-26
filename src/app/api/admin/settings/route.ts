import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { getPlatformSettings, updatePlatformSettings } from '@/lib/contentStore';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = requireSession(req, ['ADMIN']);
    if (!auth.ok) return auth.response;

    const settings = getPlatformSettings();
    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to load settings' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = requireSession(req, ['ADMIN']);
    if (!auth.ok) return auth.response;

    const body = await req.json();
    const { creatorCommissionPercent } = body || {};
    const val = Number(creatorCommissionPercent);

    if (!Number.isFinite(val) || val < 50 || val > 95) {
      return NextResponse.json(
        { success: false, message: 'creatorCommissionPercent must be between 50 and 95' },
        { status: 400 }
      );
    }

    const settings = updatePlatformSettings(val);
    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to update settings' },
      { status: 500 }
    );
  }
}
