import { NextRequest, NextResponse } from 'next/server';
import { bookingService } from '@/app/lib/services/booking-service';
import { getServerSession } from '@/app/lib/firebase/server-auth';
import { AssignmentTeamMember } from '@/app/types/booking';

export async function GET(req: NextRequest, context: { params: Promise<{ bookingId: string }> }) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { bookingId } = await context.params;

  try {
    const booking = await bookingService.getBookingById(bookingId);

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (session.role === 'customer' && booking.userId !== session.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (session.role === 'team') {
      const isAssigned = booking.assignments.some((a) => a.memberId === session.id);
      if (!isAssigned) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ bookingId: string }> }) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { bookingId } = await context.params;
  const updates = await req.json();

  try {
    const existingBooking = await bookingService.getBookingById(bookingId);
    if (!existingBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (session.role === 'admin') {
      const updatedBooking = await bookingService.updateBooking(bookingId, updates);
      return NextResponse.json({ booking: updatedBooking });
    }

    if (session.role === 'customer') {
      if (existingBooking.userId !== session.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      if (existingBooking.status !== 'pending') {
        return NextResponse.json(
          { error: 'Cannot modify booking after approval' },
          { status: 403 }
        );
      }

      const allowedUpdates = {
        eventType: updates.eventType,
        eventName: updates.eventName,
        startDate: updates.startDate,
        endDate: updates.endDate,
        venue: updates.venue,
        notes: updates.notes,
        packages: updates.packages,
      };

      const updatedBooking = await bookingService.updateBooking(bookingId, allowedUpdates);
      return NextResponse.json({ booking: updatedBooking });
    }

    if (session.role === 'team') {
      const isAssigned = existingBooking.assignments.some((a) => a.memberId === session.id);
      if (!isAssigned) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      if (updates.assignments) {
        const assignment = updates.assignments.find(
          (a: AssignmentTeamMember) => a.memberId === session.id
        );
        if (assignment) {
          const updatedBooking = await bookingService.updateAssignment(
            bookingId,
            session.id,
            assignment
          );
          return NextResponse.json({ booking: updatedBooking });
        }
      }

      return NextResponse.json({ error: 'Invalid update' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ bookingId: string }> }
) {
  const session = await getServerSession();

  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { bookingId } = await context.params;

  try {
    const success = await bookingService.deleteBooking(bookingId);

    if (!success) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Booking deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
