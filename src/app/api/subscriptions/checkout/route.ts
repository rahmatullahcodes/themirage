import { NextResponse } from 'next/server';
import { calculateCommission } from '@/lib/commission';
import { getUserFromAuthHeader } from '@/lib/auth';
import {
  subscribeUserToCreator,
  resolveCreatorId,
  getCreatorNameById,
  recordTransaction,
  getPlatformSettings,
} from '@/lib/contentStore';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    const user = getUserFromAuthHeader(authHeader);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
    }

    const { creatorId, amount } = body || {};
    const numericAmount = parseFloat(amount);

    if (!creatorId || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ error: 'Valid creatorId and positive amount are required' }, { status: 400 });
    }

    const resolvedCreatorId = resolveCreatorId(String(creatorId));
    const creatorName = getCreatorNameById(resolvedCreatorId);

    // Record active subscription entitlement in contentStore so subscriber-only media unlocks on backend
    subscribeUserToCreator(user.userId, resolvedCreatorId);

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

