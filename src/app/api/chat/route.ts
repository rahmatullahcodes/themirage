import { NextRequest, NextResponse } from 'next/server';
import { getUserFromAuthHeader } from '@/lib/auth';
import { getChatMessagesForThread, addChatMessage } from '@/lib/contentStore';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl?.searchParams || new URL(req.url, 'http://localhost:3000').searchParams;
    const tokenUser = getUserFromAuthHeader(req.headers.get('Authorization'));
    const userId = tokenUser?.userId || searchParams.get('userId') || 'usr-1';
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
    const { userId: bodyUserId, creator, text, sender = 'user', customRequestId } = body || {};
    const userId = tokenUser?.userId || bodyUserId || 'usr-1';

    if (!creator || !text) {
      return NextResponse.json({ success: false, message: 'creator and text required' }, { status: 400 });
    }

    const message = addChatMessage({
      userId,
      creatorHandle: creator,
      sender: sender === 'creator' ? 'creator' : 'user',
      text,
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
