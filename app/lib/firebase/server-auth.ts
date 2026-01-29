import { cookies } from 'next/headers';
import { userService } from '@/app/lib/services/user-service.server';
import { User, UserRole } from '@/app/types/user';
import { redirect } from 'next/navigation';

export async function getServerSession(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('firebase-session')?.value;

    if (!sessionCookie) return null;

    // ✅ Lazy import so ./admin isn't evaluated during build collection
    const { getAdminAuthClient } = await import('./admin');

    const decodedToken = await getAdminAuthClient().verifySessionCookie(sessionCookie, true);
    const user = await userService.getUserByEmail(decodedToken.email!);

    return user;
  } catch (error) {
    console.error('Error getting server session:', error);
    return null;
  }
}

export async function requireAuth(): Promise<User> {
  const user = await getServerSession();
  if (!user) redirect('/signin');
  return user;
}

export async function requireRole(allowedRoles: UserRole[]): Promise<User> {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) redirect('/unauthorized');
  return user;
}

export async function isAdmin(): Promise<boolean> {
  const user = await getServerSession();
  return user?.role === 'admin';
}

export async function isTeam(): Promise<boolean> {
  const user = await getServerSession();
  return user?.role === 'team' || user?.role === 'admin';
}

export async function clearFirebaseSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('firebase-session');
}
