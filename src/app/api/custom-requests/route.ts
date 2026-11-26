import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import {
  findCreatorByUserId,
  findUserById,
  getCustomRequests,
  createCustomRequest,
  payCustomRequest,
  deliverCustomRequest,
  updateCustomRequest,
  deleteCustomRequest,
  isCreatorSuspended,
} from '@/lib/contentStore';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = requireSession(req);
    if (!auth.ok) return auth.response;

    const session = auth.user;
    const searchParams = req.nextUrl?.searchParams || new URL(req.url, 'http://localhost:3000').searchParams;

    if (session.role === 'CREATOR') {
      const ownCreator = findCreatorByUserId(session.userId);
      const ownCreatorId = ownCreator?.id || session.userId;
      const creatorIdParam = searchParams.get('creatorId') || undefined;
      const customerIdParam = searchParams.get('customerId') || undefined;
      const requests = getCustomRequests({
        creatorId: creatorIdParam,
        customerId: customerIdParam,
      }).filter((r) => r.creatorId === ownCreatorId || r.customerId === session.userId);
      return NextResponse.json({ success: true, count: requests.length, requests });
    }

    if (session.role === 'ADMIN') {
      const creatorId = searchParams.get('creatorId') || undefined;
      const customerId = searchParams.get('customerId') || undefined;
      const requests = getCustomRequests({ creatorId, customerId });
      return NextResponse.json({ success: true, count: requests.length, requests });
    }

    const requests = getCustomRequests({ customerId: session.userId });
    return NextResponse.json({ success: true, count: requests.length, requests });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch custom requests' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = requireSession(req);
    if (!auth.ok) return auth.response;

    const session = auth.user;
    const body = await req.json();
    const {
      customerId: bodyCustomerId,
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
    if (isCreatorSuspended(String(targetCreator))) {
      return NextResponse.json(
        { success: false, message: 'This creator account is currently suspended.' },
        { status: 400 }
      );
    }

    const ownCreator = session.role === 'CREATOR' ? findCreatorByUserId(session.userId) : undefined;
    const targetHandleLower = String(targetCreator).replace(/^@/, '').toLowerCase();
    const isCreatorSendingOffer =
      Boolean(ownCreator) &&
      (ownCreator?.id === targetCreator || ownCreator?.handle.toLowerCase() === targetHandleLower) &&
      !paid &&
      Boolean(bodyCustomerId);

    const targetCustomerId =
      isCreatorSendingOffer || (session.role === 'ADMIN' && bodyCustomerId)
        ? String(bodyCustomerId)
        : session.userId;
    const customerRecord = findUserById(targetCustomerId);
    const senderRecord = findUserById(session.userId);

    const request = createCustomRequest({
      customerId: targetCustomerId,
      customerName: customerRecord?.name || senderRecord?.name || session.username,
      customerHandle: customerRecord ? `@${customerRecord.username}` : `@${session.username}`,
      creatorIdOrHandle: targetCreator,
      title,
      description,
      price: Number(price) || 35,
      paid: Boolean(paid),
    });

    return NextResponse.json({ success: true, request });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to create custom request' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = requireSession(req);
    if (!auth.ok) return auth.response;

    const session = auth.user;
    const body = await req.json();
    const { requestId, action, deliveredMediaUrl } = body || {};

    if (!requestId || !action) {
      return NextResponse.json({ success: false, message: 'requestId and action required' }, { status: 400 });
    }

    const reqItem = getCustomRequests().find((r) => r.id === requestId);
    if (!reqItem) {
      return NextResponse.json({ success: false, message: 'Custom order not found' }, { status: 404 });
    }

    const ownCreator = session.role === 'CREATOR' ? findCreatorByUserId(session.userId) : undefined;
    const isAdmin = session.role === 'ADMIN';
    const isCustomerOwner = reqItem.customerId === session.userId;
    const isCreatorOwner = Boolean(ownCreator && reqItem.creatorId === ownCreator.id);

    if (action === 'PAY') {
      if (!isCustomerOwner && !isAdmin) {
        return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
      }
      const result = payCustomRequest(requestId, isAdmin ? reqItem.customerId : session.userId);
      if (!result.success) {
        return NextResponse.json({ success: false, message: result.error }, { status: 404 });
      }
      return NextResponse.json({ success: true, request: result.request });
    }

    if (action === 'DELIVER') {
      if (!isCreatorOwner && !isAdmin) {
        return NextResponse.json({ success: false, message: 'Forbidden: Only assigned creator can deliver' }, { status: 403 });
      }
      const result = deliverCustomRequest(requestId, deliveredMediaUrl || '');
      if (!result.success) {
        return NextResponse.json({ success: false, message: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, request: result.request });
    }

    if (action === 'UPDATE') {
      if (!isCreatorOwner && !isAdmin) {
        return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
      }
      const { title, description, price, status } = body || {};
      const result = updateCustomRequest(requestId, { title, description, price, status });
      if (!result.success) {
        return NextResponse.json({ success: false, message: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, request: result.request });
    }

    if (action === 'CANCEL') {
      if (!isCreatorOwner && !isCustomerOwner && !isAdmin) {
        return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
      }
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
    const auth = requireSession(req);
    if (!auth.ok) return auth.response;

    const session = auth.user;
    const searchParams = req.nextUrl?.searchParams || new URL(req.url, 'http://localhost:3000').searchParams;
    const requestId = searchParams.get('requestId');
    if (!requestId) {
      return NextResponse.json({ success: false, message: 'requestId is required' }, { status: 400 });
    }

    const reqItem = getCustomRequests().find((r) => r.id === requestId);
    if (!reqItem) {
      return NextResponse.json({ success: false, message: 'Custom order not found' }, { status: 404 });
    }

    const ownCreator = session.role === 'CREATOR' ? findCreatorByUserId(session.userId) : undefined;
    const allowed =
      session.role === 'ADMIN' ||
      reqItem.customerId === session.userId ||
      Boolean(ownCreator && reqItem.creatorId === ownCreator.id);

    if (!allowed) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
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
