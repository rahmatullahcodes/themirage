import { NextRequest, NextResponse } from 'next/server';
import { purchaseIndividualContent } from '@/lib/contentStore';
import { getUserFromAuthHeader } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid JSON request body' },
        { status: 400 }
      );
    }

    const tokenUser = getUserFromAuthHeader(req.headers.get('Authorization'));
    const { postId, userId: bodyUserId, userName: bodyUserName } = body || {};
    const userId = tokenUser?.userId || bodyUserId || 'usr-1';
    const userName = tokenUser?.username || bodyUserName || 'Alex Mercer';

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
      const status = result.error === 'Content not found' ? 404 : 400;
      return NextResponse.json(
        { success: false, message: result.error },
        { status }
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

