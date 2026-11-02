import { NextRequest, NextResponse } from 'next/server';
import {
  getFeedForUser,
  getCreatorPublicPreviews,
  getCreatorPreviewCounts,
  createCreatorPost,
  updatePostDetails,
  MediaType,
  Visibility,
  PostStatus,
} from '@/lib/contentStore';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl?.searchParams || (req.url.startsWith('http') ? new URL(req.url).searchParams : new URL(req.url, 'http://localhost:3000').searchParams);
    const handle = searchParams.get('handle') || undefined;
    const userId = searchParams.get('userId') || null;
    const previewsOnly = searchParams.get('previews') === 'true';

    // If previews parameter requested, return the creator's 3 photo previews & 2 video previews
    if (previewsOnly && handle) {
      const previews = getCreatorPublicPreviews(handle);
      return NextResponse.json({
        success: true,
        handle,
        previews,
        counts: {
          photos: previews.photos.length,
          videos: previews.videos.length,
          maxPhotos: 3,
          maxVideos: 2,
        },
      });
    }

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
      videoDuration,
      visibility = 'PURCHASE_ONLY',
      status = 'PUBLISHED',
      price = 0,
      isPublicPreview = false,
    } = body;

    if (!title || !mediaUrl) {
      return NextResponse.json(
        { success: false, message: 'Title and media URL are required' },
        { status: 400 }
      );
    }

    try {
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
        videoDuration,
        visibility: visibility as Visibility,
        status: status as PostStatus,
        price: Number(price),
        isPublicPreview: Boolean(isPublicPreview),
      });

      return NextResponse.json({
        success: true,
        message: 'Post created successfully',
        post: newPost,
      });
    } catch (err: any) {
      return NextResponse.json(
        { success: false, message: err?.message || 'Failed to create post' },
        { status: 400 }
      );
    }
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

