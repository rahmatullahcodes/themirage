import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { getAdminReports, updateReportStatusAdmin, deleteReportAdmin, PostStatus } from '@/lib/contentStore';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = requireSession(req, ['ADMIN']);
    if (!auth.ok) return auth.response;

    const reports = getAdminReports();
    return NextResponse.json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = requireSession(req, ['ADMIN']);
    if (!auth.ok) return auth.response;

    const body = await req.json();
    const { reportId, status, postAction } = body || {};

    if (!reportId || !['PENDING', 'RESOLVED', 'DISMISSED'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Valid reportId and status required' },
        { status: 400 }
      );
    }

    const result = updateReportStatusAdmin(reportId, status, postAction as PostStatus | undefined);
    if (!result.success) {
      return NextResponse.json({ success: false, message: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      report: result.report,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to update report' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = requireSession(req, ['ADMIN']);
    if (!auth.ok) return auth.response;

    const searchParams = req.nextUrl?.searchParams || new URL(req.url, 'http://localhost:3000').searchParams;
    const reportId = searchParams.get('reportId');
    if (!reportId) {
      return NextResponse.json({ success: false, message: 'reportId is required' }, { status: 400 });
    }
    const result = deleteReportAdmin(reportId);
    if (!result.success) {
      return NextResponse.json({ success: false, message: 'Report not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Report deleted' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to delete report' },
      { status: 500 }
    );
  }
}
