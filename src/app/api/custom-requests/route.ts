import { NextRequest, NextResponse } from 'next/server';
import { getUserFromAuthHeader } from '@/lib/auth';
import {
  getCustomRequests,
  createCustomRequest,
  payCustomRequest,
  deliverCustomRequest,
  updateCustomRequest,
  deleteCustomRequest,
} from '@/lib/contentStore';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl?.searchParams || new URL(req.url, 'http://localhost:3000').searchParams;
    const creatorId = searchParams.get('creatorId') || undefined;
    const customerId = searchParams.get('customerId') || undefined;

    const requests = getCustomRequests({ creatorId, customerId });
    return NextResponse.json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch custom requests' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const tokenUser = getUserFromAuthHeader(req.headers.get('Authorization'));
    const {
      customerId: bodyCustomerId,
      customerName,
      customerHandle,
      creatorHandle,
      creatorId,
      title,
      description,
      price,
      paid = false,
    } = body || {};

    const targetCreator = creatorHandle || creatorId;
    if (!targetCreator || !title) {
      return NextResponse.json(
        { success: false, message: 'creatorHandle and title are required' },
        { status: 400 }
      );
    }

    const request = createCustomRequest({
      customerId: tokenUser?.userId || bodyCustomerId || 'usr-1',
      customerName,
      customerHandle: tokenUser?.username ? `@${tokenUser.username}` : customerHandle,
      creatorIdOrHandle: targetCreator,
      title,
      description,
      price: Number(price) || 35,
      paid: Boolean(paid),
    });

    return NextResponse.json({
      success: true,
      request,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to create custom request' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const tokenUser = getUserFromAuthHeader(req.headers.get('Authorization'));
    const { requestId, action, deliveredMediaUrl, userId: bodyUserId } = body || {};

    if (!requestId || !action) {
      return NextResponse.json({ success: false, message: 'requestId and action required' }, { status: 400 });
    }

    if (action === 'PAY') {
      const result = payCustomRequest(requestId, tokenUser?.userId || bodyUserId || 'usr-1');
      if (!result.success) {
        return NextResponse.json({ success: false, message: result.error }, { status: 404 });
      }
      return NextResponse.json({ success: true, request: result.request });
    }

    if (action === 'DELIVER') {
      const result = deliverCustomRequest(requestId, deliveredMediaUrl || '');
      if (!result.success) {
        return NextResponse.json({ success: false, message: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, request: result.request });
    }

    if (action === 'UPDATE') {
      const { title, description, price, status } = body || {};
      const result = updateCustomRequest(requestId, { title, description, price, status });
      if (!result.success) {
        return NextResponse.json({ success: false, message: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, request: result.request });
    }

    if (action === 'CANCEL') {
      const result = updateCustomRequest(requestId, { status: 'CANCELLED' });
      if (!result.success) {
        return NextResponse.json({ success: false, message: result.error }, { status: 404 });
      }
      return NextResponse.json({ success: true, request: result.request });
    }

    return NextResponse.json({ success: false, message: 'Unsupported action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to update custom request' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const searchParams = req.nextUrl?.searchParams || new URL(req.url, 'http://localhost:3000').searchParams;
    const requestId = searchParams.get('requestId');
    if (!requestId) {
      return NextResponse.json({ success: false, message: 'requestId is required' }, { status: 400 });
    }
    const result = deleteCustomRequest(requestId);
    if (!result.success) {
      return NextResponse.json({ success: false, message: result.error || 'Custom order not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Custom order deleted' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to delete custom request' },
      { status: 500 }
    );
  }
}
