export const CATEGORY = [
  { label: 'Wedding', value: 'wedding' },
  { label: 'Corporate', value: 'corporate' },
  { label: 'Promotional', value: 'promotional' },
  { label: 'Event', value: 'event' },
  { label: 'Music Video', value: 'music_video' },
  { label: 'Documentary', value: 'documentary' },
  { label: 'Birthday', value: 'birthday' },
  { label: 'Others', value: 'others' },
] as const;

export type Category = (typeof CATEGORY)[number]['value'];

export interface Package {
  id: string;
  name: string;
  price: number;
  description: string;
  deliverables: string[];
  preview: string;
  duration: string;
  popular?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Packages {
  id: string;
  category: Category;
  packages: Package[];
  createdAt: string;
  updatedAt: string;
}
