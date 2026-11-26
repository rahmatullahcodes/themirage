import { NextRequest, NextResponse } from 'next/server';
import { checkMediaAuthorization } from '@/lib/contentStore';
import { getSessionUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const postId = context?.params?.id;
    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const session = getSessionUser(req);
    const userId = session?.userId || null;

    const authResult = checkMediaAuthorization(userId, postId);

    if (!authResult.authorized) {
      const status = authResult.error === 'Post not found' ? 404 : 403;
      return NextResponse.json(
        {
          authorized: false,
          error: authResult.error || 'Access denied. You do not own this media.',
        },
        { status }
      );
    }

    return NextResponse.json({
      authorized: true,
      mediaUrl: authResult.post?.mediaUrl,
      mediaType: authResult.post?.mediaType,
      title: authResult.post?.title,
      creatorName: authResult.post?.creatorName,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Internal server error checking media access' },
      { status: 500 }
    );
  }
}
