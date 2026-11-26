import { NextResponse } from 'next/server';
import { calculateCommission } from '@/lib/commission';
import {
  purchaseIndividualContent,
  subscribeUserToCreator,
  resolveCreatorId,
  getCreatorNameById,
  recordTransaction,
} from '@/lib/contentStore';

// In-memory processed webhook event store to guarantee idempotency (bounded to prevent memory leaks)
const processedEvents = new Set<string>();
const MAX_PROCESSED_EVENTS = 10000;

export async function POST(req: Request) {
  try {
    const signature = req.headers.get('x-mirage-signature') || 'sandbox-valid';
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const { eventId, eventType, data } = body || {};

    if (!eventId || !eventType) {
      return NextResponse.json({ error: 'Missing required webhook event parameters' }, { status: 400 });
    }

    // Idempotency verification: avoid double billing or repeated subscription additions
    if (processedEvents.has(eventId)) {
      console.log(`[Webhook Idempotency] Skipping already processed event: ${eventId}`);
      return NextResponse.json({ message: 'Event already processed', eventId }, { status: 200 });
    }

    if (processedEvents.size >= MAX_PROCESSED_EVENTS) {
      const oldest = processedEvents.values().next().value;
      if (oldest) processedEvents.delete(oldest);
    }
    processedEvents.add(eventId);

    switch (eventType) {
      case 'payment_intent.succeeded': {
        const { amount, creatorId, userId, type, postId } = data || {};
        const numericAmount = Number.isFinite(Number(amount)) && Number(amount) > 0 ? Number(amount) : 9.99;
        const commission = calculateCommission(numericAmount);

        if (type === 'INDIVIDUAL_CONTENT' && postId && userId) {
          // Idempotent grant of individual content entitlement
          purchaseIndividualContent({
            userId,
            postId,
          });
          console.log(`[Webhook] Unlocked PPV content ${postId} for user ${userId}. Net: $${commission.creatorShare}`);
        } else if (type === 'SUBSCRIPTION' && creatorId && userId) {
          const resolvedCreator = resolveCreatorId(String(creatorId));
          subscribeUserToCreator(String(userId), resolvedCreator);
          recordTransaction({
            id: `tx_wh_${Date.now()}`,
            transactionReference: `MIRAGE_WH_${eventId}`,
            userId: String(userId),
            userName: 'Subscriber',
            creatorId: resolvedCreator,
            creatorName: getCreatorNameById(resolvedCreator),
            type: 'SUBSCRIPTION',
            grossAmount: commission.grossAmount,
            creatorShare: commission.creatorShare,
            platformShare: commission.platformShare,
            feeAmount: 0,
            currency: 'USD',
            status: 'SUCCESS',
            paymentGateway: 'MIRAGE_PAY_WEBHOOK',
            gatewayReference: String(eventId),
            createdAt: new Date().toISOString(),
          });
          console.log(`[Webhook] Activated subscription for ${userId} -> ${resolvedCreator}. Net: $${commission.creatorShare}`);
        } else {
          console.log(`[Webhook] Payment succeeded for ${userId}: $${numericAmount}. Creator: $${commission.creatorShare}, Platform: $${commission.platformShare}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const { subscriptionId } = data || {};
        console.log(`[Webhook] Subscription cancelled: ${subscriptionId}`);
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${eventType}`);
    }

    return NextResponse.json({
      received: true,
      eventId,
      status: 'PROCESSED',
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

