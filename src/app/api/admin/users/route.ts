import { NextRequest, NextResponse } from 'next/server';
import { requireSession, hashPassword } from '@/lib/auth';
import {
  listAllUsers,
  registerNewUser,
  sanitizeUserRecord,
  updateUserStatusAdmin,
  updateUserAdmin,
  deleteUserAdmin,
  AccountStatus,
  UserRole,
} from '@/lib/contentStore';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = requireSession(req, ['ADMIN']);
    if (!auth.ok) return auth.response;

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

export async function POST(req: NextRequest) {
  try {
    const auth = requireSession(req, ['ADMIN']);
    if (!auth.ok) return auth.response;

    const body = await req.json();
    const { name, username, email, password, role = 'SUBSCRIBER', bio, status } = body || {};

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and password are required' },
        { status: 400 }
      );
    }
    if (String(password).length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(String(password));
    const derivedUsername =
      (username && String(username).trim()) ||
      String(name)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '') ||
      `user_${Date.now()}`;

    const assignedRole: UserRole =
      role === 'ADMIN' || role === 'CREATOR' || role === 'SUBSCRIBER' ? role : 'SUBSCRIBER';

    const result = registerNewUser({
      name: String(name).trim(),
      username: derivedUsername,
      email: String(email).trim().toLowerCase(),
      passwordHash,
      role: assignedRole,
      allowAdminRole: true,
      bio,
      status: status === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE',
    });

    if (!result.success || !result.user) {
      return NextResponse.json(
        { success: false, message: result.error || 'Failed to create account' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      user: sanitizeUserRecord(result.user),
      creator: result.creator,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to create user account' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = requireSession(req, ['ADMIN']);
    if (!auth.ok) return auth.response;

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
    const auth = requireSession(req, ['ADMIN']);
    if (!auth.ok) return auth.response;

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
