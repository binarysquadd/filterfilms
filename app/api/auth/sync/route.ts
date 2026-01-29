import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminAuthClient } from '@/app/lib/firebase/admin';
import { userService } from '@/app/lib/services/user-service.server';

export async function POST(req: NextRequest) {
  try {
    const { token, name } = (await req.json()) as { token?: string; name?: string };

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 400 });
    }

    // ✅ get the admin auth client (lazy / safe)
    const adminAuth = getAdminAuthClient();

    // Verify the Firebase ID token
    const decodedToken = await adminAuth.verifyIdToken(token);

    const email = decodedToken.email;
    if (!email) {
      return NextResponse.json({ error: 'Token does not contain an email' }, { status: 400 });
    }

    // Get or create user in database
    let user = await userService.getUserByEmail(email);

    if (!user) {
      user = await userService.createUser({
        email,
        name: name || decodedToken.name || '',
        image: decodedToken.picture,
        role: 'customer', // Default role for NEW users only
      });
    }

    // Create session cookie (5 days)
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await adminAuth.createSessionCookie(token, { expiresIn });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('firebase-session', sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 5, // 5 days in seconds
      path: '/',
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('❌ Error in /api/auth/sync:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
