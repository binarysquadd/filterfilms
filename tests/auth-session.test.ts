import { describe, it, expect, vi } from 'vitest';

vi.mock('@/app/lib/firebase/server-auth', () => ({
  getServerSession: vi.fn(async () => null),
}));

import { GET } from '@/app/api/auth/session/route';

describe('/api/auth/session', () => {
  const originalError = console.error;

  beforeEach(() => {
    console.error = () => {};
  });

  afterEach(() => {
    console.error = originalError;
  });

  it('returns 401 when no session', async () => {
    const res = await GET();
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.user).toBeNull();
  });

  it('returns 200 when session exists', async () => {
    const { getServerSession } = await import('@/app/lib/firebase/server-auth');
    vi.mocked(getServerSession).mockResolvedValueOnce({ id: '1', role: 'admin' } as never);

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.user).toBeTruthy();
  });

  it('returns 500 on exception', async () => {
    const { getServerSession } = await import('@/app/lib/firebase/server-auth');
    vi.mocked(getServerSession).mockRejectedValueOnce(new Error('boom'));

    const res = await GET();
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('Failed to get session');
  });
});
