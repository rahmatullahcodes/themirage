import { NextRequest, NextResponse } from 'next/server';
import { listAllUsers, updateUserStatusAdmin, AccountStatus } from '@/lib/contentStore';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const users = listAllUsers();
    return NextResponse.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, status } = body || {};

    if (!userId || (status !== 'ACTIVE' && status !== 'SUSPENDED')) {
      return NextResponse.json(
        { success: false, message: 'Valid userId and status (ACTIVE|SUSPENDED) are required' },
        { status: 400 }
      );
    }

    const result = updateUserStatusAdmin(userId, status as AccountStatus);
    if (!result.success) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: result.user,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to update user status' },
      { status: 500 }
    );
  }
}
