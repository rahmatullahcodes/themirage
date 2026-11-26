import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, requireSession } from '@/lib/auth';
import {
  findCreatorByUserId,
  resolveCreatorId,
  getFeedForUser,
  getCreatorStudioPosts,
  getCreatorPublicPreviews,
  createCreatorPost,
  updatePostDetails,
  updatePostAdmin,
  deletePost,
  incrementPostLike,
  MediaType,
  Visibility,
  PostStatus,
} from '@/lib/contentStore';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl?.searchParams || (req.url.startsWith('http') ? new URL(req.url).searchParams : new URL(req.url, 'http://localhost:3000').searchParams);
    const handle = searchParams.get('handle') || undefined;
    const previewsOnly = searchParams.get('previews') === 'true';
    const isStudio = searchParams.get('studio') === 'true';

    // Public creator preview showcase (capped at 3 photos & 2 videos)
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

    // Creator Studio feed strictly scoped to caller's own creator profile (or Admin filter)
    if (isStudio) {
      const auth = requireSession(req, ['CREATOR', 'ADMIN']);
      if (!auth.ok) return auth.response;

      const targetHandle =
        auth.user.role === 'CREATOR'
          ? findCreatorByUserId(auth.user.userId)?.handle || auth.user.username
          : handle;
      const posts = getCreatorStudioPosts(targetHandle);
      return NextResponse.json({
        success: true,
        count: posts.length,
        posts,
      });
    }

    const session = getSessionUser(req);
    const posts = getFeedForUser(handle, session?.userId || null);

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
    const auth = requireSession(req, ['CREATOR', 'ADMIN']);
    if (!auth.ok) return auth.response;

    const body = await req.json();
    const {
      creatorId: bodyCreatorId,
      creatorHandle: bodyCreatorHandle,
      creatorName: bodyCreatorName,
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

    const ownCreator = findCreatorByUserId(auth.user.userId);
    const targetCreatorId =
      auth.user.role === 'CREATOR'
        ? ownCreator?.id || resolveCreatorId(auth.user.userId)
        : resolveCreatorId(bodyCreatorId || bodyCreatorHandle || 'c1');
    const targetHandle =
      auth.user.role === 'CREATOR'
        ? ownCreator?.handle || auth.user.username
        : bodyCreatorHandle || ownCreator?.handle || 'luna-rae';
    const targetName =
      auth.user.role === 'CREATOR'
        ? ownCreator?.name || auth.user.username
        : bodyCreatorName || ownCreator?.name || 'Creator';

    try {
      const newPost = createCreatorPost({
        creatorId: targetCreatorId,
        creatorHandle: targetHandle,
        creatorName: targetName,
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
    const { postId, updates, action } = body || {};

    if (action === 'LIKE' && postId) {
      const likeRes = incrementPostLike(postId);
      if (!likeRes.success) {
        return NextResponse.json({ success: false, message: 'Post not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, post: likeRes.post });
    }

    const auth = requireSession(req, ['CREATOR', 'ADMIN']);
    if (!auth.ok) return auth.response;

    if (!postId || !updates) {
      return NextResponse.json(
        { success: false, message: 'postId and updates object are required' },
        { status: 400 }
      );
    }

    if (auth.user.role === 'ADMIN') {
      const adminRes = updatePostAdmin(postId, updates);
      if (!adminRes.success) {
        return NextResponse.json(
          { success: false, message: adminRes.error || 'Post not found' },
          { status: adminRes.error === 'Post not found' ? 404 : 400 }
        );
      }
      return NextResponse.json({
        success: true,
        message: 'Post updated successfully',
        post: adminRes.post,
      });
    }

    const ownCreator = findCreatorByUserId(auth.user.userId);
    const ownerCreatorId = ownCreator?.id || resolveCreatorId(auth.user.userId);
    const result = updatePostDetails(postId, ownerCreatorId, updates);

    if (!result.success) {
      const status =
        result.error === 'Post not found'
          ? 404
          : result.error?.startsWith('Unauthorized')
          ? 403
          : 400;
      return NextResponse.json(
        { success: false, message: result.error },
        { status }
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

export async function DELETE(req: NextRequest) {
  try {
    const auth = requireSession(req, ['CREATOR', 'ADMIN']);
    if (!auth.ok) return auth.response;

    const searchParams = req.nextUrl?.searchParams || new URL(req.url, 'http://localhost:3000').searchParams;
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json({ success: false, message: 'postId is required' }, { status: 400 });
    }

    const isAdmin = auth.user.role === 'ADMIN';
    const ownCreatorId = isAdmin
      ? 'admin'
      : findCreatorByUserId(auth.user.userId)?.id || resolveCreatorId(auth.user.userId);

    const result = deletePost(postId, ownCreatorId, isAdmin);
    if (!result.success) {
      const status =
        result.error === 'Post not found'
          ? 404
          : result.error?.startsWith('Unauthorized')
          ? 403
          : 400;
      return NextResponse.json({ success: false, message: result.error }, { status });
    }

    return NextResponse.json({
      success: true,
      message: 'Post deleted permanently',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to delete post' },
      { status: 500 }
    );
  }
}
