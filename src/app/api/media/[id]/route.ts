import { NextRequest, NextResponse } from 'next/server';
import { checkMediaAuthorization } from '@/lib/contentStore';

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const postId = context?.params?.id;
    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const searchParams = req.nextUrl?.searchParams || (req.url.startsWith('http') ? new URL(req.url).searchParams : new URL(req.url, 'http://localhost:3000').searchParams);
    const userId = searchParams.get('userId') || 'usr-1';

    const authResult = checkMediaAuthorization(userId, postId);

    if (!authResult.authorized) {
      return NextResponse.json(
        {
          authorized: false,
          error: authResult.error || 'Access denied. You do not own this media.',
        },
        { status: 403 }
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

