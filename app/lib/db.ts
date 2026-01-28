import { driveService } from "./google-drive.server";

export async function getUsers() {
    return driveService.getCollection('users');
}

export async function saveUser(users: any[]) {
    return driveService.saveCollection('users', users);
}


export async function getBookings() {
  return driveService.getCollection('bookings');
}

export async function saveBookings(bookings: any[]) {
  return driveService.saveCollection('bookings', bookings);
}