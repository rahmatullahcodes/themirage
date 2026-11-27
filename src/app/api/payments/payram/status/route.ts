import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import {
  findPendingPayment,
  settlePendingPayment,
  updatePendingPaymentStatus,
} from '@/lib/contentStore';
import { fetchPayramPaymentStatus, isPayramActive } from '@/lib/payram';

export const dynamic = 'force-dynamic';

/** Checks live payment confirmation status & automatically settles entitlement once FILLED on PayRam. */
export async function GET(req: NextRequest) {
  try {
    const auth = requireSession(req);
    if (!auth.ok) return auth.response;

    const searchParams = req.nextUrl?.searchParams || new URL(req.url, 'http://localhost:3000').searchParams;
    const referenceId = (searchParams.get('referenceId') || searchParams.get('ref') || '').trim();
    if (!referenceId) {
      return NextResponse.json({ success: false, message: 'referenceId is required' }, { status: 400 });
    }

    const pending = findPendingPayment(referenceId);
    if (!pending) {
      return NextResponse.json({ success: false, message: 'Payment invoice not found' }, { status: 404 });
    }

    if (pending.userId !== auth.user.userId && auth.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    if (pending.status === 'FILLED' || pending.status === 'OVER_FILLED') {
      return NextResponse.json({
        success: true,
        settled: true,
        payment: pending,
      });
    }

    if (pending.status === 'OPEN' && isPayramActive() && pending.payramReferenceId) {
      const liveCheck = await fetchPayramPaymentStatus(pending.payramReferenceId);
      if (liveCheck.ok) {
        if (liveCheck.status === 'FILLED' || liveCheck.status === 'OVER_FILLED') {
          const settled = settlePendingPayment(pending.id, {
            paymentGateway: 'PAYRAM',
            currency: liveCheck.currency,
            network: liveCheck.network,
            txHash: liveCheck.txHash,
            status: liveCheck.status,
          });
          return NextResponse.json({
            success: true,
            settled: true,
            payment: settled.pending || pending,
          });
        }
        if (liveCheck.status !== 'OPEN') {
          updatePendingPaymentStatus(pending.id, liveCheck.status, {
            currency: liveCheck.currency,
            network: liveCheck.network,
            txHash: liveCheck.txHash,
          });
        }
      }
    }

    const refreshed = findPendingPayment(pending.id) || pending;
    return NextResponse.json({
      success: true,
      settled: refreshed.status === 'FILLED' || refreshed.status === 'OVER_FILLED',
      payment: refreshed,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to check PayRam status' },
      { status: 500 }
    );
  }
}
