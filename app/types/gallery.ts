export interface Gallery {
  id: string;
  type: 'photo' | 'video';
  url: string;
  thumbnail?: string;
  title: string;
  category: string;
  eventType: string;
  createdAt: string;
  updatedAt: string;
}
