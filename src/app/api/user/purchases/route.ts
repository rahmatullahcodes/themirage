import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getUserPurchasesLibrary } from '@/lib/contentStore';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionUser(req);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl?.searchParams || (req.url.startsWith('http') ? new URL(req.url).searchParams : new URL(req.url, 'http://localhost:3000').searchParams);
    const requestedId = searchParams.get('userId');
    const userId = session.role === 'ADMIN' && requestedId ? requestedId : session.userId;

    const userPurchases = getUserPurchasesLibrary(userId);

    return NextResponse.json({
      success: true,
      count: userPurchases.length,
      purchases: userPurchases,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch user purchases' },
      { status: 500 }
    );
  }
}
