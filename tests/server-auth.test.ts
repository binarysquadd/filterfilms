import { describe, it, expect, vi, beforeEach } from 'vitest';

const cookieGetMock = vi.fn();
const cookieDeleteMock = vi.fn();

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    get: cookieGetMock,
    delete: cookieDeleteMock,
  })),
}));

const verifySessionCookieMock = vi.fn();

vi.mock('@/app/lib/firebase/admin', () => ({
  getAdminAuthClient: vi.fn(() => ({
    verifySessionCookie: verifySessionCookieMock,
  })),
}));

vi.mock('@/app/lib/services/user-service.server', () => ({
  userService: {
    getUserByEmail: vi.fn(async () => ({ id: '1', role: 'admin', email: 'x@example.com' })),
  },
}));

import { getServerSession, clearFirebaseSessionCookie } from '@/app/lib/firebase/server-auth';

describe('server-auth', () => {
  const originalError = console.error;

  beforeEach(() => {
    cookieGetMock.mockReset();
    cookieDeleteMock.mockReset();
    verifySessionCookieMock.mockReset();
    console.error = () => {};
  });

  afterEach(() => {
    console.error = originalError;
  });

  it('returns null when no session cookie', async () => {
    cookieGetMock.mockReturnValue(undefined);
    const session = await getServerSession();
    expect(session).toBeNull();
  });

  it('returns null when verifySessionCookie throws', async () => {
    cookieGetMock.mockReturnValue({ value: 'bad' });
    verifySessionCookieMock.mockRejectedValueOnce(new Error('bad'));
    const session = await getServerSession();
    expect(session).toBeNull();
  });

  it('returns user when session is valid', async () => {
    cookieGetMock.mockReturnValue({ value: 'good' });
    verifySessionCookieMock.mockResolvedValueOnce({ email: 'x@example.com' });
    const session = await getServerSession();
    expect(session?.email).toBe('x@example.com');
  });

  it('clears firebase session cookie', async () => {
    await clearFirebaseSessionCookie();
    expect(cookieDeleteMock).toHaveBeenCalledWith('firebase-session');
  });
});
