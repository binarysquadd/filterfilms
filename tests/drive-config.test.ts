import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { driveService } from '@/app/lib/google-drive.server';

describe('driveService.healthCheck', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.GOOGLE_OAUTH_CLIENT_ID;
    delete process.env.GOOGLE_OAUTH_CLIENT_SECRET;
    delete process.env.GOOGLE_OAUTH_REFRESH_TOKEN;
    delete process.env.GOOGLE_DRIVE_FOLDER_ID;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('returns missing_env when required config is absent', async () => {
    const result = await driveService.healthCheck();

    expect(result.ok).toBe(false);
    expect(result.error?.reason).toBe('missing_env');
  });
});
