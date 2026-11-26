import { NextRequest, NextResponse } from 'next/server';
import {
  listAllUsers,
  updateUserStatusAdmin,
  updateUserAdmin,
  deleteUserAdmin,
  AccountStatus,
  UserRole,
} from '@/lib/contentStore';

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
    const { userId, status, name, username, email, role, bio } = body || {};

    if (!userId) {
      return NextResponse.json({ success: false, message: 'userId is required' }, { status: 400 });
    }

    const hasProfileUpdates =
      name !== undefined ||
      username !== undefined ||
      email !== undefined ||
      role !== undefined ||
      bio !== undefined;

    if (hasProfileUpdates) {
      const result = updateUserAdmin(userId, {
        name,
        username,
        email,
        role: role as UserRole,
        status: status as AccountStatus,
        bio,
      });
      if (!result.success) {
        return NextResponse.json(
          { success: false, message: result.error || 'Failed to update user' },
          { status: result.error === 'User not found' ? 404 : 400 }
        );
      }
      return NextResponse.json({ success: true, user: result.user });
    }

    if (status !== 'ACTIVE' && status !== 'SUSPENDED') {
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

export async function DELETE(req: NextRequest) {
  try {
    const searchParams = req.nextUrl?.searchParams || new URL(req.url, 'http://localhost:3000').searchParams;
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ success: false, message: 'userId is required' }, { status: 400 });
    }
    const result = deleteUserAdmin(userId);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error || 'User not found' },
        { status: result.error === 'User not found' ? 404 : 400 }
      );
    }
    return NextResponse.json({ success: true, message: 'User deleted permanently' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to delete user' },
      { status: 500 }
    );
  }
}
