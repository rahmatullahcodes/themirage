import { NextRequest, NextResponse } from 'next/server';
import {
  getFeedForUser,
  createCreatorPost,
  updatePostDetails,
  MediaType,
  Visibility,
  PostStatus,
} from '@/lib/contentStore';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const handle = url.searchParams.get('handle') || undefined;
    const userId = url.searchParams.get('userId') || null;

    const posts = getFeedForUser(handle, userId);

    return NextResponse.json({
      success: true,
      count: posts.length,
      posts,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      creatorId = 'c1',
      creatorHandle = 'luna-rae',
      creatorName = 'Luna Rae',
      title,
      caption = '',
      mediaType = 'IMAGE',
      mediaUrl,
      thumbnailUrl,
      previewUrl,
      visibility = 'PURCHASE_ONLY',
      status = 'PUBLISHED',
      price = 0,
    } = body;

    if (!title || !mediaUrl) {
      return NextResponse.json(
        { success: false, message: 'Title and media URL are required' },
        { status: 400 }
      );
    }

    const newPost = createCreatorPost({
      creatorId,
      creatorHandle,
      creatorName,
      title,
      caption,
      mediaType: mediaType as MediaType,
      mediaUrl,
      thumbnailUrl: thumbnailUrl || mediaUrl,
      previewUrl,
      visibility: visibility as Visibility,
      status: status as PostStatus,
      price: Number(price),
    });

    return NextResponse.json({
      success: true,
      message: 'Post created successfully',
      post: newPost,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to create post' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { postId, creatorId = 'c1', updates } = body;

    if (!postId || !updates) {
      return NextResponse.json(
        { success: false, message: 'postId and updates object are required' },
        { status: 400 }
      );
    }

    const result = updatePostDetails(postId, creatorId, updates);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Post updated successfully',
      post: result.post,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to update post' },
      { status: 500 }
    );
  }
}

