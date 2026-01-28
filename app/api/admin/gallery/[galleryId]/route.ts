import { getServerSession } from '@/app/lib/firebase/server-auth';
import { galleryService } from '@/app/lib/services/gallery-service';
import { NextResponse } from 'next/server';

// GET all galleries by galleryId
export async function GET(req: Request, context: { params: Promise<{ galleryId: string }> }) {
  const session = await getServerSession();
  if (!session || !['admin', 'customer', 'team'].includes(session.role)) {
    return NextResponse.json(
      { error: `Unauthorized not having required role${session ? `: ${session.role}` : ''}` },
      { status: 401 }
    );
  }
  try {
    const { galleryId } = await context.params;
    const gallery = await galleryService.getGalleryById(galleryId);
    if (!gallery) {
      return NextResponse.json({ error: 'Gallery not found' }, { status: 404 });
    }
    return NextResponse.json({ gallery });
  } catch (error) {
    console.error('Error fetching gallery:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request, context: { params: Promise<{ galleryId: string }> }) {
  const session = await getServerSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { galleryId } = await context.params;
    const updates = await req.json();
    const updatedGallery = await galleryService.updateGallery(galleryId, updates);
    if (!updatedGallery) {
      return NextResponse.json({ error: 'Gallery not found' }, { status: 404 });
    }
    return NextResponse.json({ gallery: updatedGallery });
  } catch (error) {
    console.error('Error updating gallery:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ galleryId: string }> }) {
  const session = await getServerSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { galleryId } = await context.params;
    const deleted = await galleryService.deleteGallery(galleryId);
    if (!deleted) {
      return NextResponse.json({ error: 'Gallery not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Gallery deleted successfully' });
  } catch (error) {
    console.error('Error deleting gallery:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
