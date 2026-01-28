import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('firebase-session');

    console.log('🚪 User logged out');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error in /api/auth/logout:', error);
    return NextResponse.json({ error: 'Failed to logout' }, { status: 500 });
  }
}
