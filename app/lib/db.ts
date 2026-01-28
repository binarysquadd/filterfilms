import { driveService } from './google-drive.server';
import { User } from '@/app/types/user';
import { Booking } from '@/app/types/booking';

export async function getUsers(): Promise<User[]> {
  return driveService.getCollection('users');
}

export async function saveUser(users: User[]): Promise<void> {
  return driveService.saveCollection('users', users);
}

export async function getBookings(): Promise<Booking[]> {
  return driveService.getCollection('bookings');
}

export async function saveBookings(bookings: Booking[]): Promise<void> {
  return driveService.saveCollection('bookings', bookings);
}
