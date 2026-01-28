export type UserRole = 'admin' | 'team' | 'customer';

export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  role: UserRole;
  emailVerified?: string; // ISO date string
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string

  // Team-specific fields (only for role: "team")
  teamProfile?: {
    specialization?: string;
    experience?: string;
    bio?: string;
    instagram?: string;
    phoneNumber?: string;
    emergencyContact?: string;
    joiningDate?: string;
    salary?: string;
    department?: string;
  };

  // Customer-specific fields (only for role: "customer")
  customerProfile?: {
    phoneNumber?: string;
    address?: string;
    preferences?: string[];
    bookingHistory?: string[]; // Array of booking IDs
  };
}
