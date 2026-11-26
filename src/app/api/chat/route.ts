import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import {
  findCreatorByUserId,
  getChatMessagesForThread,
  addChatMessage,
  getChatConversationsForUser,
} from '@/lib/contentStore';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = requireSession(req);
    if (!auth.ok) return auth.response;

    const session = auth.user;
    const searchParams = req.nextUrl?.searchParams || new URL(req.url, 'http://localhost:3000').searchParams;
    const mode = searchParams.get('mode');

    if (mode === 'threads') {
      const roleParam = (searchParams.get('role') || 'SUBSCRIBER').toLowerCase();
      if (roleParam === 'creator') {
        if (session.role !== 'CREATOR') {
          return NextResponse.json(
            { success: false, message: 'Forbidden: Creator access required' },
            { status: 403 }
          );
        }
        const ownCreator = findCreatorByUserId(session.userId);
        const creatorHandle = ownCreator?.handle || session.username;
        const result = getChatConversationsForUser({
          userId: session.userId,
          mode: 'creator',
          creatorHandle,
        });
        return NextResponse.json({ success: true, ...result });
      }

      const result = getChatConversationsForUser({
        userId: session.userId,
        mode: 'user',
      });
      return NextResponse.json({ success: true, ...result });
    }

    const requestedUserId = searchParams.get('userId');
    const creatorParam = (searchParams.get('creator') || '').replace(/^@/, '').toLowerCase();

    if (requestedUserId && requestedUserId !== session.userId) {
      if (session.role !== 'CREATOR') {
        return NextResponse.json(
          { success: false, message: 'Forbidden: Cannot access another user conversation' },
          { status: 403 }
        );
      }
      const ownCreator = findCreatorByUserId(session.userId);
      const ownHandle = (ownCreator?.handle || session.username).toLowerCase();
      if (creatorParam && creatorParam !== ownHandle) {
        return NextResponse.json(
          { success: false, message: 'Forbidden: Cannot access another creator inbox' },
          { status: 403 }
        );
      }
      const messages = getChatMessagesForThread(requestedUserId, ownHandle);
      return NextResponse.json({ success: true, messages });
    }

    const targetCreator = creatorParam || 'luna-rae';
    const messages = getChatMessagesForThread(session.userId, targetCreator);
    return NextResponse.json({ success: true, messages });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to load messages' },
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
      userId: bodyUserId,
      creator,
      text,
      sender = 'user',
      mediaUrl,
      mediaType,
      customRequestId,
    } = body || {};

    if (!creator || (!text && !mediaUrl)) {
      return NextResponse.json({ success: false, message: 'creator and message text or media are required' }, { status: 400 });
    }

    const cleanCreatorHandle = String(creator).replace(/^@/, '').toLowerCase();

    if (sender === 'creator') {
      if (session.role !== 'CREATOR') {
        return NextResponse.json(
          { success: false, message: 'Forbidden: Only creators can send creator replies' },
          { status: 403 }
        );
      }
      const ownCreator = findCreatorByUserId(session.userId);
      const ownHandle = (ownCreator?.handle || session.username).toLowerCase();
      if (cleanCreatorHandle && cleanCreatorHandle !== ownHandle) {
        return NextResponse.json(
          { success: false, message: 'Forbidden: Cannot send messages as another creator' },
          { status: 403 }
        );
      }
      if (!bodyUserId) {
        return NextResponse.json({ success: false, message: 'Target userId is required' }, { status: 400 });
      }

      const message = addChatMessage({
        userId: String(bodyUserId),
        creatorHandle: ownHandle,
        sender: 'creator',
        text: text || (mediaType === 'VIDEO' ? 'Sent a video attachment' : 'Sent an image attachment'),
        mediaUrl,
        mediaType,
        customRequestId,
      });
      return NextResponse.json({ success: true, message });
    }

    const message = addChatMessage({
      userId: session.userId,
      creatorHandle: cleanCreatorHandle,
      sender: 'user',
      text: text || (mediaType === 'VIDEO' ? 'Sent a video attachment' : 'Sent an image attachment'),
      mediaUrl,
      mediaType,
      customRequestId,
    });

    return NextResponse.json({ success: true, message });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to send message' },
      { status: 500 }
    );
  }
}
