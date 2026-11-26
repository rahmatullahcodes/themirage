import { NextRequest, NextResponse } from 'next/server';
import { getUserFromAuthHeader } from '@/lib/auth';
import {
  getChatMessagesForThread,
  addChatMessage,
  getChatConversationsForUser,
} from '@/lib/contentStore';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl?.searchParams || new URL(req.url, 'http://localhost:3000').searchParams;
    const tokenUser = getUserFromAuthHeader(req.headers.get('Authorization'));
    const mode = searchParams.get('mode');

    if (mode === 'threads') {
      const userId = searchParams.get('userId') || tokenUser?.userId || 'usr-1';
      const roleParam = (searchParams.get('role') || tokenUser?.role || 'SUBSCRIBER').toLowerCase();
      const creatorHandle = searchParams.get('creatorHandle') || undefined;
      const result = getChatConversationsForUser({
        userId,
        mode: roleParam === 'creator' ? 'creator' : 'user',
        creatorHandle,
      });
      return NextResponse.json({
        success: true,
        ...result,
      });
    }

    const userId = searchParams.get('userId') || tokenUser?.userId || 'usr-1';
    const creator = searchParams.get('creator') || 'luna-rae';

    const messages = getChatMessagesForThread(userId, creator);
    return NextResponse.json({
      success: true,
      messages,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to load messages' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const tokenUser = getUserFromAuthHeader(req.headers.get('Authorization'));
    const {
      userId: bodyUserId,
      creator,
      text,
      sender = 'user',
      mediaUrl,
      mediaType,
      customRequestId,
    } = body || {};
    const userId = bodyUserId || tokenUser?.userId || 'usr-1';

    if (!creator || (!text && !mediaUrl)) {
      return NextResponse.json({ success: false, message: 'creator and message text or media are required' }, { status: 400 });
    }

    const message = addChatMessage({
      userId,
      creatorHandle: creator,
      sender: sender === 'creator' ? 'creator' : 'user',
      text: text || (mediaType === 'VIDEO' ? 'Sent a video attachment' : 'Sent an image attachment'),
      mediaUrl,
      mediaType,
      customRequestId,
    });

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to send message' },
      { status: 500 }
    );
  }
}
