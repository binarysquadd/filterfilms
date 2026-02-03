import { describe, it, expect, vi, beforeEach } from 'vitest';

const getServerSessionMock = vi.fn();

vi.mock('@/app/lib/firebase/server-auth', () => ({
  getServerSession: () => getServerSessionMock(),
}));

vi.mock('@/app/lib/services/user-service.server', () => ({
  userService: {
    getTeamMembers: vi.fn(async () => []),
    createUser: vi.fn(async () => ({ id: '1', email: 'x@example.com' })),
  },
}));

import { GET, POST } from '@/app/api/admin/users/route';

describe('/api/admin/users', () => {
  beforeEach(() => {
    getServerSessionMock.mockReset();
  });

  it('GET returns 401 when unauthenticated', async () => {
    getServerSessionMock.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('GET returns 403 when not admin', async () => {
    getServerSessionMock.mockResolvedValue({ role: 'customer' });
    const res = await GET();
    expect(res.status).toBe(403);
  });

  it('GET returns users for admin', async () => {
    getServerSessionMock.mockResolvedValue({ role: 'admin' });
    const res = await GET();
    expect(res.status).toBe(200);
    const { userService } = await import('@/app/lib/services/user-service.server');
    expect(userService.getTeamMembers).toHaveBeenCalled();
  });

  it('POST returns 401 when not admin', async () => {
    getServerSessionMock.mockResolvedValue({ role: 'customer' });
    const req = new Request('https://example.com/api/admin/users', {
      method: 'POST',
      body: JSON.stringify({ name: 'x', email: 'x@example.com' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('POST creates user for admin', async () => {
    getServerSessionMock.mockResolvedValue({ role: 'admin' });
    const req = new Request('https://example.com/api/admin/users', {
      method: 'POST',
      body: JSON.stringify({ name: 'x', email: 'x@example.com', role: 'team' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const { userService } = await import('@/app/lib/services/user-service.server');
    expect(userService.createUser).toHaveBeenCalled();
  });
});
