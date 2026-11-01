import { NextRequest, NextResponse } from 'next/server';
import { getUserPurchasesLibrary } from '@/lib/contentStore';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId') || 'usr-1';

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

