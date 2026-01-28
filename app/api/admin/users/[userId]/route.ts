import { userService } from '@/app/lib/services/user-service.server';
import { NextResponse } from 'next/server';
import { getServerSession } from '@/app/lib/firebase/server-auth';

export async function GET(req: Request, context: { params: Promise<{ userId: string }> }) {
  // ✅ MUST await params in Next 15+
  const { userId } = await context.params;
  const session = await getServerSession();

  // Authentication
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Authorization
  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
  }
  try {
    const user = await userService.getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// In your /api/admin/users/[userId]/route.ts PATCH method

export async function PATCH(req: Request, context: { params: Promise<{ userId: string }> }) {
  const { userId } = await context.params;
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
  }

  try {
    const targetUser = await userService.getUserById(userId);
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (targetUser.role === 'admin' && targetUser.id !== session.id) {
      return NextResponse.json({ error: 'Cannot modify another admin' }, { status: 400 });
    }

    const {
      name,
      email,
      role,
      photo,
      specialization,
      experience,
      bio,
      instagram,
      phoneNumber,
      address,
    } = await req.json();

    const updatedData: any = {
      name,
      email,
      role,
      image: photo,
    };

    // Update teamProfile if role is 'team'
    if (role === 'team') {
      updatedData.teamProfile = {
        specialization,
        experience,
        bio,
        instagram,
      };
    }

    // Update customerProfile if role is 'customer'
    if (role === 'customer') {
      updatedData.customerProfile = {
        phoneNumber,
        address,
      };
    }

    const updatedUser = await userService.updateUser(userId, updatedData);

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ userId: string }> }) {
  // ✅ MUST await params in Next 15+
  const { userId } = await context.params;
  const session = await getServerSession();

  // Authentication
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Authorization
  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
  }
  // Admin cannot delete self
  if (session.id === userId) {
    return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 });
  }
  try {
    const targetUser = await userService.getUserById(userId);
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    // Cannot delete another admin
    if (targetUser.role === 'admin') {
      return NextResponse.json(
        { error: 'You cannot delete another admin account' },
        { status: 400 }
      );
    }
    await userService.deleteUserById(userId);
    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
