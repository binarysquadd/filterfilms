// Mock data for Indian Wedding & Event Studio
// Used ONLY as initial seed data
import { v4 as uuidv4 } from 'uuid';

/* ===================== TYPES ===================== */

export interface Package {
  id: string;
  name: string;
  price: number;
  description: string;
  deliverables: string[];
  preview: string;
  duration: string;
  popular?: boolean;
}

export interface Booking {
  id: string;
  userId: string;
  packageId: string;
  eventType: string;
  eventName: string;
  date: string;
  venue: string;
  status: 'pending' | 'approved' | 'in-progress' | 'completed' | 'rejected';
  totalAmount: number;
  paidAmount: number;
  notes?: string;
  assignedTeam?: string[];
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'customer' | 'team';
  avatar?: string;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  specialization: string;
  photo: string;
  experience: string;
  bio: string;
  instagram?: string;
}

export interface GalleryItem {
  id: string;
  type: 'photo' | 'video';
  url: string;
  thumbnail?: string;
  title: string;
  category: string;
  eventType: string;
}

/* ===================== USERS ===================== */

export const users: User[] = [
  {
    id: 'user-1',
    name: 'Admin User',
    email: 'admin@royalweddings.com',
    phone: '+91 98765 43210',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    createdAt: '2024-01-01',
  },
  {
    id: 'user-2',
    name: 'Priya Sharma',
    email: 'priya@email.com',
    phone: '+91 98765 12345',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    createdAt: '2024-06-15',
  },
  {
    id: 'team-1',
    name: 'Arjun Kapoor',
    email: 'arjun@royalweddings.com',
    phone: '+91 99887 76655',
    role: 'team',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    createdAt: '2023-03-10',
  },
];

/* ===================== AUTH CREDENTIALS ===================== */

export const credentials = {
  admin: { email: 'admin@royalweddings.com', password: 'admin123' },
  customer: { email: 'priya@email.com', password: 'customer123' },
  team: { email: 'arjun@royalweddings.com', password: 'team123' },
};

/* ===================== INITIAL PACKAGES (SEED) ===================== */

export const packages: Package[] = [
  {
    id: uuidv4(),
    name: 'Royal Heritage',
    price: 500000,
    description: 'Our flagship package for grand celebrations with cinematic storytelling.',
    deliverables: [
      '3 Days Full Coverage',
      'Cinematic Wedding Film',
      '500+ Edited Photos',
      'Drone Coverage',
      'Photo Album',
    ],
    preview: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
    duration: '3 Days',
    popular: true,
  },
  {
    id: uuidv4(),
    name: 'Golden Moments',
    price: 300000,
    description: 'Perfect for intimate celebrations with premium quality coverage.',
    deliverables: ['2 Days Coverage', 'Wedding Film', '350+ Edited Photos'],
    preview: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800',
    duration: '2 Days',
  },
];

/* ===================== BOOKINGS (SEED) ===================== */

export const bookings: Booking[] = [
  {
    id: uuidv4(),
    userId: 'user-2',
    packageId: packages[0].id,
    eventType: 'Wedding',
    eventName: 'Priya & Vikram Wedding',
    date: '2024-12-15',
    venue: 'Taj Palace, New Delhi',
    status: 'approved',
    totalAmount: 500000,
    paidAmount: 250000,
    createdAt: '2024-08-01',
  },
];

/* ===================== TEAM ===================== */

export const teamMembers: TeamMember[] = [
  {
    id: 'team-1',
    name: 'Arjun Kapoor',
    role: 'Lead Photographer',
    specialization: 'Candid Photography',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    experience: '12 Years',
    bio: 'Award-winning photographer specializing in candid moments.',
  },
];

/* ===================== GALLERY ===================== */

export const gallery: GalleryItem[] = [
  {
    id: uuidv4(),
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200',
    title: 'Royal Mandap Ceremony',
    category: 'Ceremony',
    eventType: 'Wedding',
  },
];

// Event Types
export const eventTypes = [
  'Wedding',
  'Engagement',
  'Pre-Wedding',
  'Sangeet',
  'Mehndi',
  'Haldi',
  'Reception',
  'Anniversary',
  'Birthday',
  'Corporate Event',
];

// Booking Status Options
export const bookingStatuses = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-500' },
  { value: 'approved', label: 'Approved', color: 'bg-green-500' },
  { value: 'in-progress', label: 'In Progress', color: 'bg-blue-500' },
  { value: 'completed', label: 'Completed', color: 'bg-purple-500' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-500' },
];

/* ===================== HELPERS ===================== */

export const formatPrice = (price: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);

// Get user by ID
export const getUserById = (id: string): User | undefined => {
  return users.find((user) => user.id === id);
};
// Get package by ID
export const getPackageById = (id: string): Package | undefined => {
  return packages.find((pkg) => pkg.id === id);
};
// Get bookings by user ID
export const getBookingsByUserId = (userId: string): Booking[] => {
  return bookings.filter((booking) => booking.userId === userId);
};
// Get bookings assigned to team member
export const getBookingsByTeamId = (teamId: string): Booking[] => {
  return bookings.filter((booking) => booking.assignedTeam?.includes(teamId));
};
