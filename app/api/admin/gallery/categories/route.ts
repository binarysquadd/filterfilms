import { galleryService } from '@/app/lib/services/gallery-service';
import { NextResponse } from 'next/server';

// GET all galleries - PUBLIC ACCESS
export async function GET() {
  try {
    const categories = await galleryService.getDistinctCategories();
    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
