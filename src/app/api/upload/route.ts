import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { requireSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100MB matching Nginx limit
const ALLOWED_MIME_TYPES: Record<string, { ext: string; mediaType: 'IMAGE' | 'VIDEO' }> = {
  'image/jpeg': { ext: '.jpg', mediaType: 'IMAGE' },
  'image/jpg': { ext: '.jpg', mediaType: 'IMAGE' },
  'image/png': { ext: '.png', mediaType: 'IMAGE' },
  'image/webp': { ext: '.webp', mediaType: 'IMAGE' },
  'image/gif': { ext: '.gif', mediaType: 'IMAGE' },
  'image/heic': { ext: '.heic', mediaType: 'IMAGE' },
  'image/heif': { ext: '.heif', mediaType: 'IMAGE' },
  'image/avif': { ext: '.avif', mediaType: 'IMAGE' },
  'video/mp4': { ext: '.mp4', mediaType: 'VIDEO' },
  'video/webm': { ext: '.webm', mediaType: 'VIDEO' },
  'video/quicktime': { ext: '.mov', mediaType: 'VIDEO' },
};

function getUploadDir(): string {
  return path.join(process.cwd(), 'data', 'uploads');
}

export async function POST(req: NextRequest) {
  try {
    const auth = requireSession(req);
    if (!auth.ok) return auth.response;

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: 'No media file provided' },
        { status: 400 }
      );
    }

    if (file.size <= 0) {
      return NextResponse.json(
        { success: false, message: 'Uploaded file is empty' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, message: 'File exceeds 100MB maximum upload size' },
        { status: 413 }
      );
    }

    const mimeLower = (file.type || '').toLowerCase();
    const mimeInfo = ALLOWED_MIME_TYPES[mimeLower];
    const rawExt = path.extname(file.name || '').toLowerCase();
    const isVideoExt = ['.mp4', '.mov', '.webm', '.m4v'].includes(rawExt) || mimeLower.startsWith('video/');
    const isImageExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.heic', '.heif', '.avif'].includes(rawExt) || mimeLower.startsWith('image/');

    if (!mimeInfo && !isVideoExt && !isImageExt) {
      return NextResponse.json(
        { success: false, message: 'Unsupported file format. Please upload JPG, PNG, WEBP, GIF, MP4, MOV, or WEBM.' },
        { status: 400 }
      );
    }

    const mediaType: 'IMAGE' | 'VIDEO' = mimeInfo?.mediaType || (isVideoExt ? 'VIDEO' : 'IMAGE');
    const ext = mimeInfo?.ext || rawExt || (mediaType === 'VIDEO' ? '.mp4' : '.jpg');
    const safeName = `mirage_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`;

    const uploadDir = getUploadDir();
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const targetPath = path.join(uploadDir, safeName);
    fs.writeFileSync(targetPath, buffer);

    return NextResponse.json({
      success: true,
      url: `/api/uploads/${safeName}`,
      filename: safeName,
      mediaType,
      size: file.size,
      originalName: file.name,
    });
  } catch (error: any) {
    console.error('[Upload API Error]:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'File upload failed' },
      { status: 500 }
    );
  }
}
