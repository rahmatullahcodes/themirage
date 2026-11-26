import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const MIME_MAP: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.heic': 'image/heic',
  '.heif': 'image/heif',
  '.avif': 'image/avif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.m4v': 'video/mp4',
};

export async function GET(
  req: NextRequest,
  context: { params: { filename: string } }
) {
  try {
    const rawName = context?.params?.filename || '';
    const safeName = path.basename(rawName);
    if (!safeName || safeName !== rawName || safeName.includes('..')) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'data', 'uploads', safeName);
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Media file not found' }, { status: 404 });
    }

    const stat = fs.statSync(filePath);
    const totalSize = stat.size;
    const ext = path.extname(safeName).toLowerCase();
    const contentType = MIME_MAP[ext] || 'application/octet-stream';

    // Support HTTP Range requests for smooth iOS/Safari & Chrome video streaming
    const range = req.headers.get('range');
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;

      if (isNaN(start) || start >= totalSize || end >= totalSize || start > end) {
        return new NextResponse(null, {
          status: 416,
          headers: { 'Content-Range': `bytes */${totalSize}` },
        });
      }

      const chunkSize = end - start + 1;
      const fd = fs.openSync(filePath, 'r');
      const chunk = Buffer.alloc(chunkSize);
      fs.readSync(fd, chunk, 0, chunkSize, start);
      fs.closeSync(fd);

      return new NextResponse(chunk, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${totalSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': String(chunkSize),
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    const fileBuffer = fs.readFileSync(filePath);
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(totalSize),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to read uploaded file' },
      { status: 500 }
    );
  }
}
