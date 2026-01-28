export interface Attendance {
  id: string;
  memberId: string;
  memberName: string;
  date: string;
  status: 'present' | 'absent' | 'half-day' | 'leave';
  checkIn?: string;
  checkOut?: string;
  notes?: string;
}