import { NextRequest, NextResponse } from 'next/server';
import { purchaseIndividualContent } from '@/lib/contentStore';
import { requireSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const auth = requireSession(req);
    if (!auth.ok) return auth.response;

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid JSON request body' },
        { status: 400 }
      );
    }

    const { postId } = body || {};
    if (!postId) {
      return NextResponse.json(
        { success: false, message: 'Post ID is required' },
        { status: 400 }
      );
    }

    const result = purchaseIndividualContent({
      userId: auth.user.userId,
      userName: auth.user.username,
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
