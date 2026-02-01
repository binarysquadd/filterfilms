import { driveService } from '../google-drive.server';
import { TeamPayment } from '@/app/types/payment';
import { v4 as uuidv4 } from 'uuid';

export type CreatePaymentInput = Omit<TeamPayment, 'id'>;
export type UpdatePaymentInput = Partial<Omit<TeamPayment, 'id'>>;

export const paymentService = {
  async getAllPayments(): Promise<TeamPayment[]> {
    try {
      return await driveService.getCollection<TeamPayment>('payments');
    } catch (error) {
      console.error('Error fetching payment records:', error);
      return [];
    }
  },

  async getPaymentById(id: string): Promise<TeamPayment | null> {
    const payments = await this.getAllPayments();
    return payments.find((p) => p.id === id) ?? null;
  },

  async createPayment(data: CreatePaymentInput): Promise<TeamPayment> {
    const payments = await this.getAllPayments();

    const now = new Date().toISOString();

    const newPayment: TeamPayment = {
      ...data,
      id: uuidv4(),
      createdAt: data.createdAt ?? now,
      updatedAt: data.updatedAt ?? now,
    } as TeamPayment;

    payments.push(newPayment);
    await driveService.saveCollection('payments', payments);

    return newPayment;
  },

  async updatePayment(id: string, updates: UpdatePaymentInput): Promise<TeamPayment | null> {
    const payments = await this.getAllPayments();
    const index = payments.findIndex((p) => p.id === id);
    if (index === -1) return null;

    payments[index] = {
      ...payments[index],
      ...updates,
      id, // immutable
      updatedAt: new Date().toISOString(),
    } as TeamPayment;

    await driveService.saveCollection('payments', payments);
    return payments[index];
  },

  async deletePayment(id: string): Promise<boolean> {
    const payments = await this.getAllPayments();
    const index = payments.findIndex((p) => p.id === id);
    if (index === -1) return false;

    payments.splice(index, 1);
    await driveService.saveCollection('payments', payments);
    return true;
  },
};
