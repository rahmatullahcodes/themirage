import { NextRequest, NextResponse } from 'next/server';
import { checkMediaAuthorization } from '@/lib/contentStore';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id;
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId') || 'usr-1';

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

