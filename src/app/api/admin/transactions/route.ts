import { NextRequest, NextResponse } from 'next/server';
import { getAdminTransactions, issueRefundAdmin, deleteTransactionAdmin } from '@/lib/contentStore';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl?.searchParams || new URL(req.url, 'http://localhost:3000').searchParams;
    const type = searchParams.get('type') || undefined;
    const search = searchParams.get('search') || undefined;

    const transactions = getAdminTransactions({ type, search });
    return NextResponse.json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { txId } = body || {};

    if (!txId) {
      return NextResponse.json({ success: false, message: 'txId is required' }, { status: 400 });
    }

    const result = issueRefundAdmin(txId);
    if (!result.success) {
      return NextResponse.json({ success: false, message: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      transaction: result.transaction,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to issue refund' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const searchParams = req.nextUrl?.searchParams || new URL(req.url, 'http://localhost:3000').searchParams;
    const txId = searchParams.get('txId');
    if (!txId) {
      return NextResponse.json({ success: false, message: 'txId is required' }, { status: 400 });
    }
    const result = deleteTransactionAdmin(txId);
    if (!result.success) {
      return NextResponse.json({ success: false, message: 'Transaction not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Transaction deleted permanently' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to delete transaction' },
      { status: 500 }
    );
  }
}
