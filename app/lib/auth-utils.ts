import { redirect } from 'next/navigation';
import { UserRole } from '@/app/types/user';
import { getServerSession } from './firebase/server-auth';

export async function requireAuth() {
  const session = await getServerSession();
  if (!session) {
    redirect('/signin');
  }
  return session;
}

export async function requireRole(allowedRoles: UserRole[]) {
  const session = await requireAuth();

  if (!allowedRoles.includes(session.role)) {
    redirect('/unauthorized');
  }

  return session;
}

export async function checkRole(role: UserRole) {
  const session = await getServerSession();
  return session?.role === role;
}

export async function isAdmin() {
  return checkRole('admin');
}

export async function isTeam() {
  const session = await getServerSession();
  return session?.role === 'team' || session?.role === 'admin';
}
