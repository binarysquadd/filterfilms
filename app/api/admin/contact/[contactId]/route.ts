import { getServerSession } from '@/app/lib/firebase/server-auth';
import { contactService } from '@/app/lib/services/contact-service';
import { NextResponse } from 'next/server';

export async function PATCH(req: Request, { params }: { params: Promise<{ contactId: string }> }) {
  const session = await getServerSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { contactId } = await params; // ✅ await the promise

  try {
    const data = await req.json();
    const updates = data.updates ?? {};

    const updatedMessage = await contactService.update(contactId, updates);

    if (!updatedMessage) {
      return NextResponse.json({ error: 'Contact message not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: updatedMessage });
  } catch (error) {
    console.error('Error updating contact message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ contactId: string }> }
) {
  const session = await getServerSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { contactId } = await params; // ✅ await the promise

  const success = await contactService.delete(contactId);

  if (!success) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
