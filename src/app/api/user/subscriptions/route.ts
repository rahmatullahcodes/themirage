import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getUserSubscriptions, cancelUserSubscription } from '@/lib/contentStore';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionUser(req);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl?.searchParams || new URL(req.url, 'http://localhost:3000').searchParams;
    const requestedId = searchParams.get('userId');
    const userId = session.role === 'ADMIN' && requestedId ? requestedId : session.userId;

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
    const session = getSessionUser(req);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { subscriptionId, action } = body || {};

    if (!subscriptionId || action !== 'CANCEL') {
      return NextResponse.json(
        { success: false, message: 'subscriptionId and action=CANCEL required' },
        { status: 400 }
      );
    }

    const result = cancelUserSubscription(session.userId, subscriptionId);
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
