import { getServerSession } from '@/app/lib/firebase/server-auth';
import { paymentService } from '@/app/lib/services/payment-service';
import { NextRequest, NextResponse } from 'next/server';
import { PaymentStatus } from '@/app/types/payment';

/* ================= GET BY ID ================= */

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  const session = await getServerSession();

  if (!session || (session.role !== 'admin' && session.role !== 'team')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { paymentId } = await params;
    const payment = await paymentService.getPaymentById(paymentId);

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    return NextResponse.json({ payment });
  } catch (error) {
    console.error('Error fetching payment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/* ================= PATCH ================= */

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  const session = await getServerSession();

  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { paymentId } = await params;
    const updates = (await req.json()) as {
      amount?: number;
      status?: PaymentStatus;
      paymentDate?: string;
      notes?: string;
    };

    // ❗ Do NOT allow type mutation
    const updatedPayment = await paymentService.updatePayment(paymentId, updates);

    if (!updatedPayment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    return NextResponse.json({ payment: updatedPayment });
  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/* ================= DELETE ================= */

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  const session = await getServerSession();

  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { paymentId } = await params;
    const deleted = await paymentService.deletePayment(paymentId);

    if (!deleted) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting payment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
