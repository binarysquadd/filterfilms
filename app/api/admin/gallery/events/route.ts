import { galleryService } from '@/app/lib/services/gallery-service';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const events = await galleryService.getDistinctEventTypes();
    return NextResponse.json({ events });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
