import { Packages } from '@/app/types/package';
import { driveService } from '../google-drive.server';
import { v4 as uuidv4 } from 'uuid';

export const packageService = {
  /* ---------------- GROUP LEVEL ---------------- */

  async getAllPackageGroups(): Promise<Packages[]> {
    try {
      return await driveService.getCollection<Packages>('packages');
    } catch (error) {
      console.error('Error fetching package groups:', error);
      return [];
    }
  },

  async getPackageGroupById(groupId: string): Promise<Packages | null> {
    const groups = await this.getAllPackageGroups();
    return groups.find((g) => g.id === groupId) || null;
  },

  async createPackageGroup(
    data: Omit<Packages, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Packages> {
    const groups = await this.getAllPackageGroups();

    const newGroup: Packages = {
      id: uuidv4(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    groups.push(newGroup);
    await driveService.saveCollection('packages', groups);

    return newGroup;
  },

  async updatePackageGroup(groupId: string, updates: Partial<Packages>): Promise<Packages | null> {
    const groups = await this.getAllPackageGroups();
    const index = groups.findIndex((g) => g.id === groupId);

    if (index === -1) return null;

    groups[index] = {
      ...groups[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await driveService.saveCollection('packages', groups);
    return groups[index];
  },

  async deletePackageGroup(groupId: string): Promise<boolean> {
    const groups = await this.getAllPackageGroups();
    const index = groups.findIndex((g) => g.id === groupId);

    if (index === -1) return false;

    groups.splice(index, 1);
    await driveService.saveCollection('packages', groups);
    return true;
  },

  /* ---------------- PACKAGE LEVEL ---------------- */

  async getPackageByPackageId(packageId: string) {
    const groups = await this.getAllPackageGroups();

    for (const group of groups) {
      const pkg = group.packages.find((p) => p.id === packageId);
      if (pkg) {
        return { group, pkg };
      }
    }

    return null;
  },

  /* ---------------- QUERIES ---------------- */

  async searchPackages(query: string): Promise<Packages[]> {
    const groups = await this.getAllPackageGroups();
    return groups.filter((g) =>
      g.packages.some(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase())
      )
    );
  },

  async filterPackagesByPrice(min: number, max: number): Promise<Packages[]> {
    const groups = await this.getAllPackageGroups();
    return groups.filter((g) => g.packages.some((p) => p.price >= min && p.price <= max));
  },

  async getPopularPackages(): Promise<Packages[]> {
    const groups = await this.getAllPackageGroups();
    return groups.filter((g) => g.packages.some((p) => p.popular));
  },
};
