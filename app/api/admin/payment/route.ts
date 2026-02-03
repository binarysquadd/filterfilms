import { getServerSession } from '@/app/lib/firebase/server-auth';
import { paymentService } from '@/app/lib/services/payment-service';
import { NextResponse } from 'next/server';
import { TeamPayment } from '@/app/types/payment';

/* ================= GET ================= */

export async function GET() {
  const session = await getServerSession();

  if (!session || (session.role !== 'admin' && session.role !== 'team')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payments = await paymentService.getAllPayments();
    return NextResponse.json({ payments });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/* ================= POST ================= */

export async function POST(req: Request) {
  const session = await getServerSession();

  if (!session || (session.role !== 'admin' && session.role !== 'team')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = (await req.json()) as Omit<TeamPayment, 'id'>;

    if (!body.teamMemberId || !body.amount || !body.status || !body.type || !body.paymentDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newPayment = await paymentService.createPayment({
      ...body,
      createdBy: session.id,
    });

    return NextResponse.json({ payment: newPayment }, { status: 201 });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
