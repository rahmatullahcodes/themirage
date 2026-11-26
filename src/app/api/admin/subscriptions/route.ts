import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import {
  listAllSubscriptionsAdmin,
  updateSubscriptionStatusAdmin,
  deleteSubscriptionAdmin,
} from '@/lib/contentStore';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = requireSession(req, ['ADMIN']);
    if (!auth.ok) return auth.response;

    const subscriptions = listAllSubscriptionsAdmin();
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
    const auth = requireSession(req, ['ADMIN']);
    if (!auth.ok) return auth.response;

    const body = await req.json();
    const { subscriptionId, status } = body || {};

    if (!subscriptionId || (status !== 'ACTIVE' && status !== 'CANCELLED')) {
      return NextResponse.json(
        { success: false, message: 'Valid subscriptionId and status are required' },
        { status: 400 }
      );
    }

    const result = updateSubscriptionStatusAdmin(subscriptionId, status);
    if (!result.success) {
      return NextResponse.json({ success: false, message: 'Subscription not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      subscription: result.subscription,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to update subscription' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = requireSession(req, ['ADMIN']);
    if (!auth.ok) return auth.response;

    const searchParams = req.nextUrl?.searchParams || new URL(req.url, 'http://localhost:3000').searchParams;
    const subscriptionId = searchParams.get('subscriptionId');
    if (!subscriptionId) {
      return NextResponse.json({ success: false, message: 'subscriptionId is required' }, { status: 400 });
    }

    const result = deleteSubscriptionAdmin(subscriptionId);
    if (!result.success) {
      return NextResponse.json({ success: false, message: 'Subscription not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Subscription record removed' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to delete subscription' },
      { status: 500 }
    );
  }
}
