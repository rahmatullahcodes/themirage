import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { getAdminOverviewData } from '@/lib/contentStore';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const auth = requireSession(req, ['ADMIN']);
    if (!auth.ok) return auth.response;

    const data = getAdminOverviewData();
    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch admin overview' },
      { status: 500 }
    );
  }
}
