import { NextResponse } from 'next/server';
import { calculateCommission } from '@/lib/commission';

// In-memory processed webhook event store to guarantee idempotency (Section 11 requirement)
const processedEvents = new Set<string>();

export async function POST(req: Request) {
  try {
    const signature = req.headers.get('x-mirage-signature') || 'sandbox-valid';
    const body = await req.json();
    const { eventId, eventType, data } = body;

    if (!eventId || !eventType) {
      return NextResponse.json({ error: 'Missing required webhook event parameters' }, { status: 400 });
    }

    // Idempotency verification: avoid double billing or repeated subscription additions
    if (processedEvents.has(eventId)) {
      console.log(`[Webhook Idempotency] Skipping already processed event: ${eventId}`);
      return NextResponse.json({ message: 'Event already processed', eventId }, { status: 200 });
    }

    processedEvents.add(eventId);

    switch (eventType) {
      case 'payment_intent.succeeded': {
        const { amount, creatorId, userId, type } = data;
        const commission = calculateCommission(amount || 9.99, 85);
        console.log(`[Webhook] Payment succeeded for ${userId}: $${amount}. Creator: $${commission.creatorShare}, Platform: $${commission.platformShare}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const { subscriptionId } = data;
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

