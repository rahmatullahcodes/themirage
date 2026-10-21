import { NextResponse } from 'next/server';
import { calculateCommission } from '@/lib/commission';
import { getUserFromAuthHeader } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    const user = getUserFromAuthHeader(authHeader);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const body = await req.json();
    const { creatorId, amount } = body;

    if (!creatorId || !amount) {
      return NextResponse.json({ error: 'creatorId and amount are required' }, { status: 400 });
    }

    // Calculate commission using unified engine (85% Creator / 15% Platform)
    const commission = calculateCommission(parseFloat(amount), 85);

    const transaction = {
      id: `tx_${Date.now()}`,
      reference: `MIRAGE_SUB_${Date.now()}`,
      userId: user.userId,
      creatorId,
      grossAmount: commission.grossAmount,
      creatorShare: commission.creatorShare,
      platformShare: commission.platformShare,
      currency: 'USD',
      status: 'SUCCESS',
      type: 'SUBSCRIPTION',
      createdAt: new Date().toISOString(),
    };

    const subscription = {
      id: `sub_${Date.now()}`,
      userId: user.userId,
      creatorId,
      amount: commission.grossAmount,
      status: 'ACTIVE',
      startDate: new Date().toISOString(),
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

