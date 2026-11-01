import { NextRequest, NextResponse } from 'next/server';
import { purchaseIndividualContent, hasUserPurchasedPost } from '@/lib/contentStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { postId, userId = 'usr-1', userName = 'Alex Mercer' } = body;

    if (!postId) {
      return NextResponse.json(
        { success: false, message: 'Post ID is required' },
        { status: 400 }
      );
    }

    const result = purchaseIndividualContent({
      userId,
      userName,
      postId,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Content purchased and unlocked successfully.',
      purchase: result.purchase,
      transaction: result.transaction,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to process purchase' },
      { status: 500 }
    );
  }
}

