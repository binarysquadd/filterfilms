// lib/services/contact-service.ts
import { driveService } from '../google-drive.server';
import { ContactMessage } from '@/app/types/contact-message';
import { v4 as uuidv4 } from 'uuid';

const COLLECTION = 'contact';

export const contactService = {
  async getAll(): Promise<ContactMessage[]> {
    const messages = await driveService.getCollection<ContactMessage>(COLLECTION);
    return messages.map((m) => ({
      ...m,
      id: String(m.id),
      status: m.status ?? 'pending',
    }));
  },

  async getById(id: string): Promise<ContactMessage | null> {
    const messages = await this.getAll();
    return messages.find((m) => m.id === id) ?? null;
  },

  async create(data: Omit<ContactMessage, 'id' | 'createdAt' | 'status'>) {
    const messages = await this.getAll();

    const newMessage: ContactMessage = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      status: 'pending',
      ...data,
    };

    messages.push(newMessage);
    await driveService.saveCollection(COLLECTION, messages);
    return newMessage;
  },

  async update(id: string, updates: Partial<ContactMessage>) {
    const messages = await this.getAll();
    const index = messages.findIndex((m) => m.id === id);

    if (index === -1) return null;

    messages[index] = {
      ...messages[index],
      ...updates,
      status: updates.status ?? messages[index].status,
    };

    await driveService.saveCollection(COLLECTION, messages);
    return messages[index];
  },

  async delete(id: string) {
    const messages = await this.getAll();
    const filtered = messages.filter((m) => m.id !== id);

    if (filtered.length === messages.length) return false;

    await driveService.saveCollection(COLLECTION, filtered);
    return true;
  },

  async deleteAll() {
    await driveService.saveCollection(COLLECTION, []);
    return true;
  },
};
