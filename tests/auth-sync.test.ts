import { describe, it, expect, vi } from 'vitest';

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({ set: vi.fn() })),
}));

const verifyIdTokenMock = vi.fn(async () => ({ email: 'user@example.com', name: 'User' }));
const createSessionCookieMock = vi.fn(async () => 'cookie');

vi.mock('@/app/lib/firebase/admin', () => ({
  getAdminAuthClient: vi.fn(() => ({
    verifyIdToken: verifyIdTokenMock,
    createSessionCookie: createSessionCookieMock,
  })),
}));

vi.mock('@/app/lib/services/user-service.server', () => ({
  userService: {
    getUserByEmail: vi.fn(async () => null),
    createUser: vi.fn(async () => ({ id: '1', email: 'user@example.com' })),
  },
}));

import { POST } from '@/app/api/auth/sync/route';

describe('/api/auth/sync', () => {
  it('returns 400 when token is missing', async () => {
    const req = new Request('https://example.com/api/auth/sync', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const res = await POST(req as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(400);
  });

  it('returns 200 when token is valid', async () => {
    const req = new Request('https://example.com/api/auth/sync', {
      method: 'POST',
      body: JSON.stringify({ token: 'token', name: 'User' }),
    });

    const res = await POST(req as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.user).toBeTruthy();
  });

  it('returns 400 when token has no email', async () => {
    verifyIdTokenMock.mockResolvedValueOnce({ name: 'User' });

    const req = new Request('https://example.com/api/auth/sync', {
      method: 'POST',
      body: JSON.stringify({ token: 'token' }),
    });

    const res = await POST(req as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(400);
  });
});
