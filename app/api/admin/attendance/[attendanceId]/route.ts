import { NextRequest, NextResponse } from 'next/server';
import { attendenceService } from '@/app/lib/services/attendance-service';
import { get } from 'http';
import { getServerSession } from '@/app/lib/firebase/server-auth';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ attendanceId: string }> }
) {
  const session = await getServerSession();
  if (!session || (session.role !== 'admin' && session.role !== 'team')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { attendanceId } = await context.params;
  try {
    const attendance = await attendenceService.getAttendanceById(attendanceId);
    if (!attendance) {
      return NextResponse.json({ error: 'Attendance record not found' }, { status: 404 });
    }
    return NextResponse.json({ attendance });
  } catch (error) {
    console.error('Error fetching attendance record:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ attendanceId: string }> }
) {
  const session = await getServerSession();
  if (!session || (session.role !== 'admin' && session.role !== 'team')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { attendanceId } = await context.params;
  const updates = await req.json();
  try {
    const updatedAttendance = await attendenceService.updateAttendance(attendanceId, updates);
    if (!updatedAttendance) {
      return NextResponse.json({ error: 'Attendance record not found' }, { status: 404 });
    }
    return NextResponse.json({ attendance: updatedAttendance });
  } catch (error) {
    console.error('Error updating attendance record:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ attendanceId: string }> }
) {
  const session = await getServerSession();
  if (!session || (session.role !== 'admin' && session.role !== 'team')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { attendanceId } = await context.params;
  try {
    const deleted = await attendenceService.deleteAttendance(attendanceId);
    if (!deleted) {
      return NextResponse.json({ error: 'Attendance record not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    console.error('Error deleting attendance record:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
