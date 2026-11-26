import { NextRequest, NextResponse } from 'next/server';
import { getUserFromAuthHeader } from '@/lib/auth';
import { getUserSubscriptions, cancelUserSubscription } from '@/lib/contentStore';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl?.searchParams || new URL(req.url, 'http://localhost:3000').searchParams;
    const tokenUser = getUserFromAuthHeader(req.headers.get('Authorization'));
    const userId = tokenUser?.userId || searchParams.get('userId') || 'usr-1';

    const subscriptions = getUserSubscriptions(userId);
    return NextResponse.json({
      success: true,
      count: subscriptions.length,
      subscriptions,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const tokenUser = getUserFromAuthHeader(req.headers.get('Authorization'));
    const { subscriptionId, userId: bodyUserId, action } = body || {};
    const userId = tokenUser?.userId || bodyUserId || 'usr-1';

    if (!subscriptionId || action !== 'CANCEL') {
      return NextResponse.json(
        { success: false, message: 'subscriptionId and action=CANCEL required' },
        { status: 400 }
      );
    }

    const result = cancelUserSubscription(userId, subscriptionId);
    if (!result.success) {
      return NextResponse.json({ success: false, message: 'Subscription not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
