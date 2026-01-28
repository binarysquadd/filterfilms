export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  eventDate: string;
  message: string;
  createdAt: string;
  status?: 'pending' | 'read' | 'resolved';
}
