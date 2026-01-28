import { driveService } from "../google-drive.server";
import { Booking } from "@/app/types/booking";
import { v4 as uuidv4 } from "uuid";

export const bookingService = {
    async getAllBookings(): Promise<Booking[]> {
        try{
            const bookings = await driveService.getCollection<Booking>("bookings");
            return bookings;
        } catch (error) {
            console.error("Error fetching bookings:", error);
            return [];
        }
    },

    async getBookingById(id: string): Promise<Booking | null> {
        try {
            const bookings = await this.getAllBookings();
            const booking = bookings.find(b => b.id === id);
            return booking || null;
        } catch (error) {
            console.error("Error finding booking:", error);
            return null;
        }
    },

    async createBooking(bookingData: Omit<Booking, "id" | "createdAt">): Promise<Booking> {
        const bookings = await this.getAllBookings();
        const newBooking: Booking = {
            id: uuidv4(),
            ...bookingData,
            createdAt: new Date().toISOString(),
        };
        bookings.push(newBooking);
        await driveService.saveCollection("bookings", bookings);
        return newBooking;
    },
    async updateBooking(id: string, updates: Partial<Booking>): Promise<Booking | null> {
        const bookings = await this.getAllBookings();
        const bookingIndex = bookings.findIndex(b => b.id === id);
        if (bookingIndex === -1) return null;
        bookings[bookingIndex] = {
            ...bookings[bookingIndex],
            ...updates,
        };
        await driveService.saveCollection("bookings", bookings);
        return bookings[bookingIndex];
    },
    async deleteBooking(id: string): Promise<boolean> {
        const bookings = await this.getAllBookings();
        const bookingIndex = bookings.findIndex(b => b.id === id);
        if (bookingIndex === -1) return false;
        bookings.splice(bookingIndex, 1);
        await driveService.saveCollection("bookings", bookings);
        return true;
    },
    async getBookingsByUserId(userId: string): Promise<Booking[]> {
        const bookings = await this.getAllBookings();
        return bookings.filter(b => b.userId === userId);
    },
    async getBookingsByStatus(status: Booking['status']): Promise<Booking[]> {
        const bookings = await this.getAllBookings();
        return bookings.filter(b => b.status === status);
    },
    async searchBookings(query: string): Promise<Booking[]> {
        const bookings = await this.getAllBookings();
        return bookings.filter(b =>
            b.eventName.toLowerCase().includes(query.toLowerCase()) ||
            b.venue.toLowerCase().includes(query.toLowerCase()) ||
            b.eventType.toLowerCase().includes(query.toLowerCase())
        );
    },
    async getBookingsInDateRange(startDate: string, endDate: string): Promise<Booking[]> {
        const bookings = await this.getAllBookings();
        const start = new Date(startDate);
        const end = new Date(endDate);
        return bookings.filter(b => {
            const bookingStartDate = new Date(b.startDate);
            const bookingEndDate = new Date(b.endDate);
            return bookingStartDate <= end && bookingEndDate >= start;
        });
    },
    async getTotalRevenue(): Promise<number> {
        const bookings = await this.getAllBookings();
        return bookings.reduce((total, booking) => total + booking.paidAmount, 0);
    },
    async getBookingsByPackageId(packageId: string): Promise<Booking[]> {
        const bookings = await this.getAllBookings();
        return bookings.filter(b => 
            b.packages.some(pkg => pkg.packageId.includes(packageId))
        );
    },
    async getUpcomingBookings(): Promise<Booking[]> {
        const bookings = await this.getAllBookings();
        const now = new Date();
        return bookings.filter(b => new Date(b.startDate) > now);
    },
    async getPastBookings(): Promise<Booking[]> {
        const bookings = await this.getAllBookings();
        const now = new Date();
        return bookings.filter(b => new Date(b.endDate) <= now);
    },
    async getBookingsByAssignedTeam(teamMemberId: string): Promise<Booking[]> {
        const bookings = await this.getAllBookings();
        return bookings.filter(b => b.assignedTeam?.includes(teamMemberId));
    },
    async getBookingsWithOutstandingPayments(): Promise<Booking[]> {
        const bookings = await this.getAllBookings();
        return bookings.filter(b => b.totalAmount > b.paidAmount);
    },
    async getBookingsWithNotes(): Promise<Booking[]> {
        const bookings = await this.getAllBookings();
        return bookings.filter(b => b.notes && b.notes.trim().length > 0);
    },
    async getBookingsCountByStatus(): Promise<Record<Booking['status'], number>> {
        const bookings = await this.getAllBookings();
        return bookings.reduce((acc, booking) => {
            acc[booking.status] = (acc[booking.status] || 0) + 1;
            return acc;
        }, {} as Record<Booking['status'], number>);
    },
    async getAverageBookingAmount(): Promise<number> {
        const bookings = await this.getAllBookings();
        if (bookings.length === 0) return 0;
        const total = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
        return total / bookings.length;
    },
    async getRecentBookings(days: number): Promise<Booking[]> {
        const bookings = await this.getAllBookings();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        return bookings.filter(b => new Date(b.createdAt) >= cutoffDate);
    },
    async getBookingCount(): Promise<number> {
        const bookings = await this.getAllBookings();
        return bookings.length;
    },
    async getTotalPendingAmount(): Promise<number> {
        const bookings = await this.getAllBookings();
        return bookings.reduce((total, booking) => total + (booking.totalAmount - booking.paidAmount), 0);
    },
    async getBookingsByVenue(venue: string): Promise<Booking[]> {
        const bookings = await this.getAllBookings();
        return bookings.filter(b => b.venue.toLowerCase() === venue.toLowerCase());
    },
    async getBookingsByEventType(eventType: string): Promise<Booking[]> {
        const bookings = await this.getAllBookings();
        return bookings.filter(b => b.eventType.toLowerCase() === eventType.toLowerCase());
    },
    async getBookingsGroupedByUser(): Promise<Record<string, Booking[]>> {
        const bookings = await this.getAllBookings();
        return bookings.reduce((acc, booking) => {
            if (!acc[booking.userId]) {
                acc[booking.userId] = [];
            }
            acc[booking.userId].push(booking);
            return acc;
        }, {} as Record<string, Booking[]>);
    },
    async getBookingsGroupedByPackage(): Promise<Record<string, Booking[]>> {
        const bookings = await this.getAllBookings();
        return bookings.reduce((acc, booking) => {
            booking.packages.forEach(pkg => {
                pkg.packageId.forEach(pid => {
                    if (!acc[pid]) {
                        acc[pid] = [];
                    }
                    acc[pid].push(booking);
                });
            });
            return acc;
        }, {} as Record<string, Booking[]>);
    },
    async getTotalBookingsAmount(): Promise<number> {
        const bookings = await this.getAllBookings();
        return bookings.reduce((total, booking) => total + booking.totalAmount, 0);
    },
    async getBookingsByMonth(year: number, month: number): Promise<Booking[]> {
        const bookings = await this.getAllBookings();
        return bookings.filter(b => {
            const bookingStartDate = new Date(b.startDate);
            return bookingStartDate.getFullYear() === year && (bookingStartDate.getMonth() + 1) === month;
        });
    },
    async getBookingsByYear(year: number): Promise<Booking[]> {
        const bookings = await this.getAllBookings();
        return bookings.filter(b => {
            const bookingStartDate = new Date(b.startDate);
            return bookingStartDate.getFullYear() === year;
        });
    },
    async getBookingsWithFullPayment(): Promise<Booking[]> {
        const bookings = await this.getAllBookings();
        return bookings.filter(b => b.totalAmount === b.paidAmount);
    },
    async getBookingsWithPartialPayment(): Promise<Booking[]> {
        const bookings = await this.getAllBookings();
        return bookings.filter(b => b.paidAmount > 0 && b.paidAmount < b.totalAmount);
    },
    async getBookingsCreatedAfter(date: string): Promise<Booking[]> {
        const bookings = await this.getAllBookings();
        const compareDate = new Date(date);
        return bookings.filter(b => new Date(b.createdAt) > compareDate);
    },
}