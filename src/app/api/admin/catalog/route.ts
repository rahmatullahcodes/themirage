import { NextRequest, NextResponse } from 'next/server';
import { getAdminCatalogList, setPostStatusAdmin, PostStatus } from '@/lib/contentStore';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get('status') || undefined;
    const mediaType = url.searchParams.get('mediaType') || undefined;

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

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { postId, status } = body;

    if (!postId || !status) {
      return NextResponse.json(
        { success: false, message: 'postId and status are required' },
        { status: 400 }
      );
    }

    const result = setPostStatusAdmin(postId, status as PostStatus);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: 'Failed to update post status' },
        { status: 400 }
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

