import { NextResponse } from 'next/server';
import { calculateCommission } from '@/lib/commission';
import { requireSession } from '@/lib/auth';
import {
  subscribeUserToCreator,
  resolveCreatorId,
  getCreatorNameById,
  recordTransaction,
  getPlatformSettings,
  isCreatorSuspended,
  findUserById,
  listAllCreators,
  createPendingPayment,
  attachPayramReferenceToPendingPayment,
  updatePendingPaymentStatus,
} from '@/lib/contentStore';
import { isPayramActive, createPayramCheckoutSession } from '@/lib/payram';

export async function POST(req: Request) {
  try {
    const auth = requireSession(req);
    if (!auth.ok) return auth.response;
    const user = auth.user;

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
    }

    const { creatorId, amount, currency, network } = body || {};
    const numericAmount = parseFloat(amount);

    if (!creatorId || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ error: 'Valid creatorId and positive amount are required' }, { status: 400 });
    }

    const resolvedCreatorId = resolveCreatorId(String(creatorId));
    if (isCreatorSuspended(resolvedCreatorId)) {
      return NextResponse.json({ error: 'This creator account is currently suspended.' }, { status: 400 });
    }
    const creatorName = getCreatorNameById(resolvedCreatorId);

    if (isPayramActive()) {
      const dbUser = findUserById(user.userId);
      const targetCreator = listAllCreators({ handle: resolvedCreatorId })[0];
      const pending = createPendingPayment({
        type: 'SUBSCRIPTION',
        userId: user.userId,
        userName: dbUser?.name || user.username || 'Subscriber',
        userEmail: dbUser?.email || user.email,
        creatorId: resolvedCreatorId,
        creatorHandle: targetCreator?.handle || resolvedCreatorId,
        amountInUSD: numericAmount,
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
          { error: err?.message || 'Failed to create PayRam crypto payment session' },
          { status: 502 }
        );
      }
    }

    // Record active subscription entitlement in contentStore so subscriber-only media unlocks on backend
    const recordedSub = subscribeUserToCreator(user.userId, resolvedCreatorId);
    if (!recordedSub) {
      return NextResponse.json({ error: 'Creator account is unavailable or suspended.' }, { status: 400 });
    }

    // Calculate commission using live configured platform rule (default 85% Creator / 15% Platform)
    const settings = getPlatformSettings();
    const commission = calculateCommission(numericAmount, settings.creatorCommissionPercent);
    const now = new Date().toISOString();
    const txRef = `MIRAGE_SUB_${Date.now()}`;

    const transaction = {
      id: `tx_${Date.now()}`,
      reference: txRef,
      userId: user.userId,
      creatorId: resolvedCreatorId,
      grossAmount: commission.grossAmount,
      creatorShare: commission.creatorShare,
      platformShare: commission.platformShare,
      currency: 'USD',
      status: 'SUCCESS',
      type: 'SUBSCRIPTION',
      createdAt: now,
    };

    // Persist to unified backend ledger so creator earnings update in real time
    recordTransaction({
      id: transaction.id,
      transactionReference: txRef,
      userId: user.userId,
      userName: user.username || 'Subscriber',
      creatorId: resolvedCreatorId,
      creatorName,
      type: 'SUBSCRIPTION',
      grossAmount: commission.grossAmount,
      creatorShare: commission.creatorShare,
      platformShare: commission.platformShare,
      feeAmount: 0,
      currency: 'USD',
      status: 'SUCCESS',
      paymentGateway: 'MIRAGE_PAY',
      gatewayReference: `gw_sub_${Date.now()}`,
      createdAt: now,
    });

    const subscription = {
      id: `sub_${Date.now()}`,
      userId: user.userId,
      creatorId: resolvedCreatorId,
      amount: commission.grossAmount,
      status: 'ACTIVE',
      startDate: now,
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    return NextResponse.json({
      message: 'Subscription payment successful',
      subscription,
      transaction,
      commission,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Payment processing error' }, { status: 500 });
  }
}

