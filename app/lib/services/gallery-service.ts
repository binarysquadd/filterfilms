import { driveService } from '../google-drive.server';
import { Gallery } from '@/app/types/gallery';
import { v4 as uuidv4 } from 'uuid';

export const galleryService = {
  async getAllGalleries(): Promise<Gallery[]> {
    try {
      const gallery = await driveService.getCollection<Gallery>('gallery');
      return gallery;
    } catch (error) {
      console.error('Error fetching galleries:', error);
      return [];
    }
  },

  async getGalleryById(id: string): Promise<Gallery | null> {
    try {
      const galleries = await this.getAllGalleries();
      const gal = galleries.find((g) => g.id === id);
      return gal || null;
    } catch (error) {
      console.error('Error finding gallery:', error);
      return null;
    }
  },

  async createGallery(
    galleryData: Omit<Gallery, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Gallery> {
    const galleries = await this.getAllGalleries();
    const newGallery: Gallery = {
      id: uuidv4(),
      ...galleryData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    galleries.push(newGallery);
    await driveService.saveCollection('gallery', galleries);
    return newGallery;
  },
  async updateGallery(id: string, updates: Partial<Gallery>): Promise<Gallery | null> {
    const galleries = await this.getAllGalleries();
    const galIndex = galleries.findIndex((g) => g.id === id);
    if (galIndex === -1) return null;
    galleries[galIndex] = {
      ...galleries[galIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await driveService.saveCollection('gallery', galleries);
    return galleries[galIndex];
  },
  async deleteGallery(id: string): Promise<boolean> {
    const galleries = await this.getAllGalleries();
    const galIndex = galleries.findIndex((g) => g.id === id);
    if (galIndex === -1) return false;
    galleries.splice(galIndex, 1);
    await driveService.saveCollection('gallery', galleries);
    return true;
  },
  async deleteAllGalleries(): Promise<boolean> {
    try {
      await driveService.saveCollection('gallery', []);
      return true;
    } catch (error) {
      console.error('Error deleting all galleries:', error);
      return false;
    }
  },
  async searchGalleries(query: string): Promise<Gallery[]> {
    const galleries = await this.getAllGalleries();
    return galleries.filter(
      (g) =>
        g.title.toLowerCase().includes(query.toLowerCase()) ||
        (g.title && g.title.toLowerCase().includes(query.toLowerCase()))
    );
  },
  async getGalleriesByCategory(category: string): Promise<Gallery[]> {
    const galleries = await this.getAllGalleries();
    return galleries.filter((g) => g.category === category);
  },
  async getDistinctCategories(): Promise<string[]> {
    const galleries = await this.getAllGalleries();
    const categories = galleries
      .map((g) => g.category)
      .filter((cat, index, self) => cat && self.indexOf(cat) === index) as string[];
    return categories;
  },
  async getGalleriesByDateRange(startDate: string, endDate: string): Promise<Gallery[]> {
    const galleries = await this.getAllGalleries();
    const start = new Date(startDate);
    const end = new Date(endDate);
    return galleries.filter((g) => {
      const createdAt = new Date(g.createdAt);
      return createdAt >= start && createdAt <= end;
    });
  },
  async getLatestGalleries(limit: number = 5): Promise<Gallery[]> {
    const galleries = await this.getAllGalleries();
    return galleries
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  },
  async getDistinctEventTypes(): Promise<string[]> {
    const galleries = await this.getAllGalleries();
    const eventTypes = galleries
      .map((g) => g.eventType)
      .filter((type, index, self) => type && self.indexOf(type) === index) as string[];
    return eventTypes;
  },
};
