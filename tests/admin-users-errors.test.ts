import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const getServerSessionMock = vi.fn();

vi.mock('@/app/lib/firebase/server-auth', () => ({
  getServerSession: () => getServerSessionMock(),
}));

vi.mock('@/app/lib/services/user-service.server', () => ({
  userService: {
    getTeamMembers: vi.fn(async () => {
      throw new Error('fail');
    }),
    createUser: vi.fn(async () => {
      throw new Error('fail');
    }),
  },
}));

import { GET, POST } from '@/app/api/admin/users/route';

describe('/api/admin/users error handling', () => {
  const originalError = console.error;

  beforeEach(() => {
    getServerSessionMock.mockReset();
    console.error = () => {};
  });

  afterEach(() => {
    console.error = originalError;
  });

  it('GET returns 500 when userService throws', async () => {
    getServerSessionMock.mockResolvedValue({ role: 'admin' });
    const res = await GET();
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('Internal server error');
  });

  it('POST returns 500 when userService throws', async () => {
    getServerSessionMock.mockResolvedValue({ role: 'admin' });
    const req = new Request('https://example.com/api/admin/users', {
      method: 'POST',
      body: JSON.stringify({ name: 'x', email: 'x@example.com' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('Internal server error');
  });
});
