/* ---------------- ENUMS ---------------- */

export const PAYMENT_STATUS = [
  { label: 'Pending', value: 'pending' },
  { label: 'Completed', value: 'completed' },
  { label: 'Failed', value: 'failed' },
  { label: 'Refunded', value: 'refunded' },
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUS)[number]['value'];

export type PaymentType = 'monthly' | 'event' | 'bonus' | 'advance';

/* ---------------- BASE ---------------- */

export interface BaseTeamPayment {
  id: string;
  type: PaymentType;
  teamMemberId: string;
  createdBy: string;
  amount: number;
  status: PaymentStatus;
  paymentDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/* ---------------- MONTHLY ---------------- */

export interface MonthlyPayment extends BaseTeamPayment {
  type: 'monthly';
  month: number; // 1–12
  year: number;
}

/* ---------------- EVENT ---------------- */

export interface EventPayment extends BaseTeamPayment {
  type: 'event';
  eventId: string;
  eventName: string;
}

/* ---------------- BONUS ---------------- */

export interface BonusPayment extends BaseTeamPayment {
  type: 'bonus';
  reason: string;
}

/* ---------------- ADVANCE ---------------- */

export interface AdvancePayment extends BaseTeamPayment {
  type: 'advance';
  reason: string;
}

/* ---------------- UNION ---------------- */

export type TeamPayment = MonthlyPayment | EventPayment | BonusPayment | AdvancePayment;
