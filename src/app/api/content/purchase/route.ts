import { NextRequest, NextResponse } from 'next/server';
import {
  purchaseIndividualContent,
  findPostById,
  findUserById,
  hasUserPurchasedPost,
  isCreatorSuspended,
  getUserPurchasesLibrary,
  createPendingPayment,
  attachPayramReferenceToPendingPayment,
  updatePendingPaymentStatus,
} from '@/lib/contentStore';
import { isPayramActive, createPayramCheckoutSession } from '@/lib/payram';
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

    const { postId, currency, network } = body || {};
    if (!postId) {
      return NextResponse.json(
        { success: false, message: 'Post ID is required' },
        { status: 400 }
      );
    }

    if (isPayramActive()) {
      const post = findPostById(postId);
      if (!post) {
        return NextResponse.json({ success: false, message: 'Content not found' }, { status: 404 });
      }
      if (post.status !== 'PUBLISHED') {
        return NextResponse.json(
          { success: false, message: 'This content is not currently available for purchase.' },
          { status: 400 }
        );
      }
      if (post.creatorId === auth.user.userId) {
        return NextResponse.json(
          { success: false, message: 'Creators cannot purchase their own content.' },
          { status: 400 }
        );
      }
      if (isCreatorSuspended(post.creatorId)) {
        return NextResponse.json(
          { success: false, message: 'This creator account is currently suspended.' },
          { status: 400 }
        );
      }
      if (hasUserPurchasedPost(auth.user.userId, postId)) {
        const existing = getUserPurchasesLibrary(auth.user.userId).find(p => p.postId === postId);
        return NextResponse.json({
          success: true,
          message: 'Content already unlocked in your library.',
          purchase: existing,
        });
      }
      if (!post.price || post.price <= 0) {
        return NextResponse.json({ success: false, message: 'Invalid price for paid content.' }, { status: 400 });
      }

      const dbUser = findUserById(auth.user.userId);
      const pending = createPendingPayment({
        type: 'INDIVIDUAL_CONTENT',
        userId: auth.user.userId,
        userName: dbUser?.name || auth.user.username,
        userEmail: dbUser?.email || auth.user.email,
        creatorId: post.creatorId,
        creatorHandle: post.creatorHandle,
        postId: post.id,
        amountInUSD: post.price,
      });

      try {
        const session = await createPayramCheckoutSession({
          customerEmail: pending.userEmail,
          customerId: pending.userId,
          amountInUSD: pending.amountInUSD,
          invoiceId: pending.invoiceId,
          currency: typeof currency === 'string' && currency.trim() ? currency.trim() : undefined,
          network: typeof network === 'string' && network.trim() ? network.trim() : undefined,
        });
        attachPayramReferenceToPendingPayment(pending.id, session.referenceId, session.checkoutUrl);
        return NextResponse.json({
          success: true,
          gateway: 'PAYRAM',
          requiresRedirect: true,
          checkoutUrl: session.checkoutUrl,
          referenceId: session.referenceId,
          invoiceId: pending.invoiceId,
          status: 'OPEN',
        });
      } catch (err: any) {
        updatePendingPaymentStatus(pending.id, 'CANCELLED');
        return NextResponse.json(
          { success: false, message: err?.message || 'Failed to initiate PayRam crypto payment' },
          { status: 502 }
        );
      }
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
