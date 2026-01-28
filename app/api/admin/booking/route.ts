// /api/admin/booking/route.ts
import { getServerSession } from '@/app/lib/firebase/server-auth';
import { bookingService } from '@/app/lib/services/booking-service';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let bookings;

    // Admin can see all bookings
    if (session.role === 'admin') {
      bookings = await bookingService.getAllBookings();
    }
    // Customers can only see their own bookings
    else if (session.role === 'customer') {
      bookings = await bookingService.getBookingsByUserId(session.id);
    }
    // Team members can ONLY see bookings assigned to them
    else if (session.role === 'team') {
      bookings = await bookingService.getBookingsByAssignedTeam(session.id);
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// /api/admin/booking/route.ts
export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.role !== 'customer' && session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await req.json();

    // ✅ Updated validation for new structure
    if (!data.packages || !Array.isArray(data.packages) || data.packages.length === 0) {
      return NextResponse.json({ error: 'At least one package is required' }, { status: 400 });
    }

    if (!data.eventType || !data.eventName || !data.startDate || !data.endDate || !data.venue) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // ✅ Create booking with packages array
    const newBooking = await bookingService.createBooking({
      userId: session.id,
      packages: data.packages, // Array of packages with dates
      eventType: data.eventType,
      eventName: data.eventName,
      startDate: data.startDate, // Overall event dates
      endDate: data.endDate,
      venue: data.venue,
      status: 'pending',
      totalAmount: data.totalAmount,
      paidAmount: data.paidAmount || 0,
      notes: data.notes || '',
      assignedTeam: [],
    });

    return NextResponse.json({ booking: newBooking }, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
