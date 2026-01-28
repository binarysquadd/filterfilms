import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/app/lib/firebase/server-auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getServerSession();

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // console.log('✅ Session retrieved:', { email: user.email, role: user.role });
    return NextResponse.json({ user });
  } catch (error) {
    console.error('❌ Error in /api/auth/session:', error);
    return NextResponse.json({ error: 'Failed to get session' }, { status: 500 });
  }
}