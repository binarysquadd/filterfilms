export interface Gallery {
  id: string;
  type: 'photo' | 'video';
  videoSource?: 'external' | 'upload';
  url: string;
  thumbnail?: string;
  title: string;
  category: string;
  eventType: string;
  createdAt: string;
  updatedAt: string;
}

export type CategoryValue =
  | 'ceremony'
  | 'bridal'
  | 'portraits'
  | 'mehndi'
  | 'sangeet'
  | 'reception'
  | 'decor'
  | 'films'
  | 'birthday'
  | 'candid-shots'
  | 'event-coverage'
  | 'headshots'
  | 'team-photos'
  | 'promotional-videos'
  | 'group-photos'
  | 'couple-portraits'
  | 'family-group'
  | 'candid'
  | 'bridal-portraits'
  | 'wedding-films'
  | 'decor-details';

export type EventConfig = {
  categories: { label: string; value: CategoryValue }[];
};

export const eventTypes: Record<string, EventConfig> = {
  Wedding: {
    categories: [
      { label: 'Ceremony', value: 'ceremony' },
      { label: 'Bridal Portraits', value: 'bridal-portraits' },
      { label: 'Couple Portraits', value: 'couple-portraits' },
      { label: 'Family & Group Photos', value: 'family-group' },
      { label: 'Mehndi', value: 'mehndi' },
      { label: 'Sangeet', value: 'sangeet' },
      { label: 'Reception', value: 'reception' },
      { label: 'Decor & Details', value: 'decor-details' },
      { label: 'Candid Moments', value: 'candid' },
      { label: 'Wedding Films', value: 'films' },
    ],
  },
  Birthday: {
    categories: [
      { label: 'Birthday', value: 'birthday' },
      { label: 'Candid Shots', value: 'candid-shots' },
      { label: 'Films', value: 'films' },
    ],
  },
  Corporate: {
    categories: [
      { label: 'Event Coverage', value: 'event-coverage' },
      { label: 'Headshots', value: 'headshots' },
      { label: 'Team Photos', value: 'team-photos' },
      { label: 'Promotional Videos', value: 'promotional-videos' },
      { label: 'Films', value: 'films' },
    ],
  },
  Other: {
    categories: [
      { label: 'Event Coverage', value: 'event-coverage' },
      { label: 'Candid Shots', value: 'candid-shots' },
      { label: 'Group Photos', value: 'group-photos' },
      { label: 'Films', value: 'films' },
    ],
  },
};

export type EventType = keyof typeof eventTypes;
