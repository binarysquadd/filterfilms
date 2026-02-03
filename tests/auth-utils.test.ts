import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('next/navigation', () => {
  const redirect = vi.fn(() => {
    throw new Error('REDIRECT');
  });
  return { redirect };
});

const getServerSessionMock = vi.fn();

vi.mock('@/app/lib/firebase/server-auth', () => ({
  getServerSession: () => getServerSessionMock(),
}));

import { requireAuth, requireRole, checkRole, isAdmin, isTeam } from '@/app/lib/auth-utils';
import { redirect } from 'next/navigation';

describe('auth-utils', () => {
  beforeEach(() => {
    vi.mocked(redirect).mockClear();
    getServerSessionMock.mockReset();
  });

  it('requireAuth redirects when no session', async () => {
    getServerSessionMock.mockResolvedValue(null);
    await expect(requireAuth()).rejects.toThrow('REDIRECT');
    expect(redirect).toHaveBeenCalledWith('/signin');
  });

  it('requireRole redirects when role not allowed', async () => {
    getServerSessionMock.mockResolvedValue({ role: 'customer' });
    await expect(requireRole(['admin'])).rejects.toThrow('REDIRECT');
    expect(redirect).toHaveBeenCalledWith('/unauthorized');
  });

  it('checkRole returns true when role matches', async () => {
    getServerSessionMock.mockResolvedValue({ role: 'admin' });
    await expect(checkRole('admin')).resolves.toBe(true);
  });

  it('isAdmin returns true for admin', async () => {
    getServerSessionMock.mockResolvedValue({ role: 'admin' });
    await expect(isAdmin()).resolves.toBe(true);
  });

  it('isTeam returns true for team/admin, false otherwise', async () => {
    getServerSessionMock.mockResolvedValue({ role: 'team' });
    await expect(isTeam()).resolves.toBe(true);

    getServerSessionMock.mockResolvedValue({ role: 'admin' });
    await expect(isTeam()).resolves.toBe(true);

    getServerSessionMock.mockResolvedValue({ role: 'customer' });
    await expect(isTeam()).resolves.toBe(false);
  });
});
