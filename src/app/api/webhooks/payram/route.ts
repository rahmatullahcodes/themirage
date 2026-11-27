import { NextResponse } from 'next/server';
import {
  findPendingPayment,
  settlePendingPayment,
  updatePendingPaymentStatus,
} from '@/lib/contentStore';
import {
  resolvePayramConfig,
  normalizePayramStatus,
  verifyPayramWebhookAuth,
} from '@/lib/payram';

export const dynamic = 'force-dynamic';

/**
 * Official PayRam Webhook Receiver (configure on pay.themirage.world):
 * https://themirage.world/api/webhooks/payram
 */
export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    let payload: any;
    try {
      payload = JSON.parse(rawBody || '{}');
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const cfg = resolvePayramConfig();
    if (!verifyPayramWebhookAuth(req, rawBody, cfg)) {
      return NextResponse.json(
        { error: 'Unauthorized webhook signature or invalid API-Key' },
        { status: 401 }
      );
    }

    const referenceId = String(
      payload?.reference_id || payload?.referenceID || payload?.referenceId || payload?.id || ''
    ).trim();
    const invoiceId = String(
      payload?.invoice_id || payload?.invoiceID || payload?.invoiceId || ''
    ).trim();

    const lookupKey = referenceId || invoiceId;
    if (!lookupKey) {
      return NextResponse.json(
        { error: 'Missing reference_id or invoice_id in PayRam webhook payload' },
        { status: 400 }
      );
    }

    const existing = findPendingPayment(lookupKey) || (invoiceId ? findPendingPayment(invoiceId) : undefined);
    if (!existing) {
      return NextResponse.json({ received: true, ignored: true, reason: 'Unknown reference', referenceId: lookupKey });
    }

    const normalized = normalizePayramStatus(payload?.status, payload?.event);
    const meta = {
      paymentGateway: 'PAYRAM',
      currency: payload?.currency ? String(payload.currency) : undefined,
      network: payload?.blockchain || payload?.network ? String(payload.blockchain || payload.network) : undefined,
      txHash: payload?.txid || payload?.txHash || payload?.tx_hash ? String(payload.txid || payload.txHash || payload.tx_hash) : undefined,
      status: normalized,
    };

    if (normalized === 'FILLED' || normalized === 'OVER_FILLED') {
      const result = settlePendingPayment(existing.id, meta);
      return NextResponse.json({
        received: true,
        settled: result.success,
        alreadySettled: Boolean(result.alreadySettled),
        status: normalized,
        referenceId: existing.payramReferenceId || existing.invoiceId,
      });
    }

    updatePendingPaymentStatus(existing.id, normalized, meta);
    return NextResponse.json({
      received: true,
      settled: false,
      status: normalized,
      referenceId: existing.payramReferenceId || existing.invoiceId,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'PayRam webhook processing failed' },
      { status: 500 }
    );
  }
}
