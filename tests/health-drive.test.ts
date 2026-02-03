import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/app/lib/google-drive.server', () => ({
  driveService: {
    healthCheck: vi.fn().mockResolvedValue({ ok: true }),
  },
}));

import { GET } from '@/app/api/health/drive/route';
import { driveService } from '@/app/lib/google-drive.server';

describe('/api/health/drive', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('returns 401 when secret is set, token missing, and production', async () => {
    process.env.HEALTHCHECK_SECRET = 'secret';
    process.env.NODE_ENV = 'production';

    const res = await GET(new Request('https://example.com/api/health/drive'));

    expect(res.status).toBe(401);
  });

  it('returns 200 when secret matches and drive is ok', async () => {
    process.env.HEALTHCHECK_SECRET = 'secret';
    process.env.NODE_ENV = 'production';
    vi.mocked(driveService.healthCheck).mockResolvedValue({ ok: true });

    const res = await GET(new Request('https://example.com/api/health/drive?token=secret'));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.tokenActive).toBe(true);
    expect(driveService.healthCheck).toHaveBeenCalled();
  });

  it('returns 503 when drive check fails even with valid token', async () => {
    process.env.HEALTHCHECK_SECRET = 'secret';
    process.env.NODE_ENV = 'production';
    vi.mocked(driveService.healthCheck).mockResolvedValue({ ok: false });

    const res = await GET(new Request('https://example.com/api/health/drive?token=secret'));

    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.tokenActive).toBe(false);
  });
});
