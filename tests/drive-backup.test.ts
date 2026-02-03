import { describe, it, expect, vi, beforeEach } from 'vitest';

const createMock = vi.fn(async () => ({ data: { id: 'backup-folder' } }));
const listMock = vi.fn();
const copyMock = vi.fn(async () => ({}));
const deleteMock = vi.fn(async () => ({}));
const oauth2Mock = vi.fn(() => ({ setCredentials: vi.fn() }));

vi.mock('googleapis', () => ({
  google: {
    auth: { OAuth2: oauth2Mock },
    drive: vi.fn(() => ({
      files: {
        create: createMock,
        list: listMock,
        copy: copyMock,
        delete: deleteMock,
      },
    })),
  },
}));

const baseEnv = {
  GOOGLE_OAUTH_CLIENT_ID: 'id',
  GOOGLE_OAUTH_CLIENT_SECRET: 'secret',
  GOOGLE_OAUTH_REFRESH_TOKEN: 'refresh',
  GOOGLE_DRIVE_FOLDER_ID: 'source',
  GOOGLE_DRIVE_BACKUP_FOLDER_ID: 'root',
};

describe('drive-backup script', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    createMock.mockClear();
    listMock.mockClear();
    copyMock.mockClear();
    deleteMock.mockClear();
    oauth2Mock.mockClear();
    vi.resetModules();
  });

  it('creates backup folder and copies files', async () => {
    process.env = {
      ...originalEnv,
      ...baseEnv,
      NODE_ENV: 'test',
      DRIVE_BACKUP_DISABLE_DISCORD: '1',
    };
    listMock.mockImplementation(async ({ q }) => {
      if (q.includes('source')) {
        return {
          data: { files: [{ id: 'file1', name: 'users.json', mimeType: 'application/json' }] },
        };
      }
      return { data: { files: [] } };
    });
    await import('@/scripts/drive-backup');

    expect(createMock).toHaveBeenCalled();
    expect(copyMock).toHaveBeenCalled();
  });

  it('deletes old backups beyond retention', async () => {
    process.env = {
      ...originalEnv,
      ...baseEnv,
      NODE_ENV: 'test',
      DRIVE_BACKUP_DISABLE_DISCORD: '1',
      DRIVE_BACKUP_RETENTION: '2',
      DRIVE_BACKUP_PREFIX: 'backup',
    };

    listMock.mockImplementation(async ({ q }) => {
      if (q.includes('source')) {
        return {
          data: { files: [{ id: 'file1', name: 'users.json', mimeType: 'application/json' }] },
        };
      }
      if (q.includes("mimeType='application/vnd.google-apps.folder'")) {
        return {
          data: {
            files: [
              { id: 'b1', name: 'backup-20240101-000000Z', createdTime: '2024-01-01T00:00:00Z' },
              { id: 'b2', name: 'backup-20240102-000000Z', createdTime: '2024-01-02T00:00:00Z' },
              { id: 'b3', name: 'backup-20240103-000000Z', createdTime: '2024-01-03T00:00:00Z' },
            ],
          },
        };
      }
      return { data: { files: [] } };
    });

    await import('@/scripts/drive-backup');

    expect(deleteMock).toHaveBeenCalledTimes(1);
    expect(deleteMock).toHaveBeenCalledWith({ fileId: 'b1' });
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });
});
