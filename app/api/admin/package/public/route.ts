import { packageService } from '@/app/lib/services/package-service';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const packageGroups = await packageService.getAllPackageGroups();
    return NextResponse.json({ packageGroups });
  } catch (error) {
    console.error('Error fetching package groups:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
