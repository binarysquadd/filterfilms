// Updated booking types with start and end dates

export type BookingStatus =
  | "pending"
  | "approved"
  | "in-progress"
  | "completed"
  | "rejected";

export interface SelectedBookingPackage {
  groupId: string;
  packageId: string[];
  name: string;
  category: string;
  price: number;
  startDate: string; // Start date for this package
  endDate: string;   // End date for this package
}

export interface Booking {
  id: string;
  userId: string;
  packages: SelectedBookingPackage[];
  eventType: string;
  eventName: string;
  startDate: string; // Overall event start date
  endDate: string;   // Overall event end date
  venue: string;
  status: BookingStatus;
  totalAmount: number;
  paidAmount: number;
  notes?: string;
  assignedTeam?: string[];
  createdAt: string;
}