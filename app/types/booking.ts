// -----------------------------
// Booking & Assignment Types
// -----------------------------

export type BookingStatus = 'pending' | 'approved' | 'in-progress' | 'completed' | 'rejected';

// Edit categories
export type AssignmentCategory = 'photo_edit' | 'video_edit_traditional' | 'video_edit_cinematic';

// -----------------------------
// Selected Package
// -----------------------------

export interface SelectedBookingPackage {
  groupId: string;
  packageId: string[];
  name: string;

  // High-level category for UI grouping
  category: 'photo_edit' | 'video_edit';

  price: number;

  startDate: string;
  endDate: string;
}

// -----------------------------
// Team Assignment
// -----------------------------

export interface AssignmentTeamMember {
  memberId: string;
  category: AssignmentCategory;

  assignedDate: string;
  completedDate?: string;

  comments?: string;

  // Team marks this
  isCompleted: boolean;
}

// -----------------------------
// Progress Summary (Customer View)
// -----------------------------

export interface BookingProgress {
  totalTasks: number;
  completedTasks: number;
  percentage: number;
}

// -----------------------------
// Booking (FINAL)
// -----------------------------

export interface Booking {
  id: string;
  userId: string;

  eventType: string;
  eventName: string;

  startDate: string;
  endDate: string;

  venue: string;

  // Admin-controlled status
  status: BookingStatus;

  totalAmount: number;
  paidAmount: number;

  packages: SelectedBookingPackage[];

  // Team assignments
  assignments: AssignmentTeamMember[];

  // Computed / stored progress
  progress: BookingProgress;

  notes?: string;

  createdAt: string;
  updatedAt: string;
}
