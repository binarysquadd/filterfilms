// /api/bookings/[bookingId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { bookingService } from "@/app/lib/services/booking-service";
import { getServerSession } from "@/app/lib/firebase/server-auth";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ bookingId: string }> }
) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { bookingId } = await context.params;

  try {
    const booking = await bookingService.getBookingById(bookingId);

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (
      session.role === "customer" &&
      booking.userId !== session.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error("Error fetching booking:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ bookingId: string }> }
) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { bookingId } = await context.params;
  const updates = await req.json();

  try {
    const existingBooking = await bookingService.getBookingById(bookingId);
    if (!existingBooking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Admin
    if (session.role === "admin") {
      const updatedBooking = await bookingService.updateBooking(
        bookingId,
        updates
      );
      return NextResponse.json({ booking: updatedBooking });
    }

    // Customer
    if (session.role === "customer") {
      if (existingBooking.userId !== session.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      if (existingBooking.status !== "pending") {
        return NextResponse.json(
          { error: "Cannot modify booking after approval" },
          { status: 403 }
        );
      }

      const allowedUpdates = {
        eventType: updates.eventType,
        eventName: updates.eventName,
        date: updates.date,
        venue: updates.venue,
        notes: updates.notes,
      };

      const updatedBooking = await bookingService.updateBooking(
        bookingId,
        allowedUpdates
      );
      return NextResponse.json({ booking: updatedBooking });
    }

    // Team
    if (session.role === "team") {
      const allowedUpdates = {
        status: updates.status,
        assignedTeam: updates.assignedTeam,
      };

      const updatedBooking = await bookingService.updateBooking(
        bookingId,
        allowedUpdates
      );
      return NextResponse.json({ booking: updatedBooking });
    }

    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ bookingId: string }> }
) {
  const session = await getServerSession();

  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { bookingId } = await context.params;

  try {
    const success = await bookingService.deleteBooking(bookingId);

    if (!success) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting booking:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
