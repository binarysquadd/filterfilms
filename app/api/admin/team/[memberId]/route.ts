import { getServerSession } from '@/app/lib/firebase/server-auth';
import { userService } from '@/app/lib/services/user-service.server';
import { NextRequest, NextResponse } from 'next/server';

// GET single team member
export async function GET(req: NextRequest, context: { params: Promise<{ memberId: string }> }) {
  const session = await getServerSession();

  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { memberId } = await context.params;

    const member = await userService.getUserById(memberId);

    if (!member || member.role !== 'team') {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
    }

    return NextResponse.json({ member });
  } catch (error) {
    console.error('Error fetching team member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH update team member
export async function PATCH(req: NextRequest, context: { params: Promise<{ memberId: string }> }) {
  const session = await getServerSession();

  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { memberId } = await context.params;
    const updates = await req.json();

    // Get existing member
    const member = await userService.getUserById(memberId);
    if (!member || member.role !== 'team') {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
    }

    const userUpdates: any = {};

    // Basic fields
    if (updates.name !== undefined) userUpdates.name = updates.name;
    if (updates.email !== undefined) userUpdates.email = updates.email;
    if (updates.photo !== undefined) userUpdates.image = updates.photo;

    // Merge team profile safely
    const teamProfileUpdates = {
      ...member.teamProfile,
      ...updates.teamProfile,
    };

    if (updates.specialization !== undefined)
      teamProfileUpdates.specialization = updates.specialization;
    if (updates.experience !== undefined) teamProfileUpdates.experience = updates.experience;
    if (updates.bio !== undefined) teamProfileUpdates.bio = updates.bio;
    if (updates.instagram !== undefined) teamProfileUpdates.instagram = updates.instagram;
    if (updates.assignment !== undefined) teamProfileUpdates.assignment = updates.assignment;
    if (updates.progress !== undefined) teamProfileUpdates.progress = updates.progress;
    if (updates.attendance !== undefined) teamProfileUpdates.attendance = updates.attendance;
    if (updates.phoneNumber !== undefined) teamProfileUpdates.phoneNumber = updates.phoneNumber;
    if (updates.department !== undefined) teamProfileUpdates.department = updates.department;

    userUpdates.teamProfile = teamProfileUpdates;

    const updatedMember = await userService.updateUser(memberId, userUpdates);

    if (!updatedMember) {
      return NextResponse.json({ error: 'Failed to update member' }, { status: 500 });
    }

    return NextResponse.json({ member: updatedMember });
  } catch (error) {
    console.error('Error updating team member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE team member
export async function DELETE(req: NextRequest, context: { params: Promise<{ memberId: string }> }) {
  const session = await getServerSession();

  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { memberId } = await context.params;

    const deleted = await userService.deleteUserById(memberId);

    if (!deleted) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting team member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
