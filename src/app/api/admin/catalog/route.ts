import { NextRequest, NextResponse } from 'next/server';
import {
  getAdminCatalogList,
  setPostStatusAdmin,
  updatePostAdmin,
  deletePost,
  PostStatus,
} from '@/lib/contentStore';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl?.searchParams || (req.url.startsWith('http') ? new URL(req.url).searchParams : new URL(req.url, 'http://localhost:3000').searchParams);
    const status = searchParams.get('status') || undefined;
    const mediaType = searchParams.get('mediaType') || undefined;

    const catalog = getAdminCatalogList({ status, mediaType });

    return NextResponse.json({
      success: true,
      count: catalog.length,
      catalog,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch admin catalog' },
      { status: 500 }
    );
  }
}

const ALLOWED_STATUSES: PostStatus[] = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];

export async function PATCH(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid JSON request body' },
        { status: 400 }
      );
    }

    const { postId, status, updates } = body || {};

    if (!postId) {
      return NextResponse.json(
        { success: false, message: 'postId is required' },
        { status: 400 }
      );
    }

    if (updates && typeof updates === 'object') {
      const result = updatePostAdmin(postId, updates);
      if (!result.success) {
        return NextResponse.json(
          { success: false, message: result.error || 'Post not found' },
          { status: result.error === 'Post not found' ? 404 : 400 }
        );
      }
      return NextResponse.json({
        success: true,
        message: 'Post updated successfully',
        post: result.post,
      });
    }

    if (!status) {
      return NextResponse.json(
        { success: false, message: 'postId and status are required' },
        { status: 400 }
      );
    }

    if (!ALLOWED_STATUSES.includes(status as PostStatus)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status. Allowed values: DRAFT, PUBLISHED, ARCHIVED' },
        { status: 400 }
      );
    }

    const result = setPostStatusAdmin(postId, status as PostStatus);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Post status changed to ${status}`,
      post: result.post,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to update post status' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const searchParams = req.nextUrl?.searchParams || new URL(req.url, 'http://localhost:3000').searchParams;
    const postId = searchParams.get('postId');
    if (!postId) {
      return NextResponse.json({ success: false, message: 'postId is required' }, { status: 400 });
    }
    const result = deletePost(postId, 'admin', true);
    if (!result.success) {
      return NextResponse.json({ success: false, message: result.error || 'Post not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Post deleted permanently' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to delete post' },
      { status: 500 }
    );
  }
}

