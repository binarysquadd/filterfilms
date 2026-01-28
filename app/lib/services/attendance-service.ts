import { driveService } from '../google-drive.server';
import { Attendance } from '@/app/types/attendance';
import { v4 as uuidv4 } from 'uuid';

type AttendanceUpdates = Omit<Partial<Attendance>, 'id'>;

export const attendenceService = {
  async getAllAttendance(): Promise<Attendance[]> {
    try {
      return await driveService.getCollection<Attendance>('attendance');
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      return [];
    }
  },

  async getAttendanceById(id: string): Promise<Attendance | null> {
    const attendanceRecords = await this.getAllAttendance();
    return attendanceRecords.find((a) => a.id === id) ?? null;
  },

  async createAttendance(attendanceData: Omit<Attendance, 'id'>): Promise<Attendance> {
    const attendanceRecords = await this.getAllAttendance();

    const newAttendance: Attendance = {
      id: uuidv4(),
      ...attendanceData,
    };

    attendanceRecords.push(newAttendance);
    await driveService.saveCollection('attendance', attendanceRecords);

    return newAttendance;
  },

  async updateAttendance(id: string, updates: AttendanceUpdates): Promise<Attendance | null> {
    const attendanceRecords = await this.getAllAttendance();
    const index = attendanceRecords.findIndex((a) => a.id === id);

    if (index === -1) return null;

    attendanceRecords[index] = {
      ...attendanceRecords[index],
      ...updates,
      id, // 🔒 enforce immutability
    };

    await driveService.saveCollection('attendance', attendanceRecords);
    return attendanceRecords[index];
  },

  async deleteAttendance(id: string): Promise<boolean> {
    const attendanceRecords = await this.getAllAttendance();
    const index = attendanceRecords.findIndex((a) => a.id === id);

    if (index === -1) return false;

    attendanceRecords.splice(index, 1);
    await driveService.saveCollection('attendance', attendanceRecords);
    return true;
  },
};
