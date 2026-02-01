import { google, type drive_v3 } from 'googleapis';
import { logger } from './logger';

type DriveCtx = {
  drive: drive_v3.Drive;
  folderId: string;
};

let cachedCtx: DriveCtx | null = null;
let didWarnMissingConfig = false;

function getDriveConfigError(): string | null {
  const missing: string[] = [];

  if (!process.env.GOOGLE_OAUTH_CLIENT_ID) missing.push('GOOGLE_OAUTH_CLIENT_ID');
  if (!process.env.GOOGLE_OAUTH_CLIENT_SECRET) missing.push('GOOGLE_OAUTH_CLIENT_SECRET');
  if (!process.env.GOOGLE_OAUTH_REFRESH_TOKEN) missing.push('GOOGLE_OAUTH_REFRESH_TOKEN');
  if (!process.env.GOOGLE_DRIVE_FOLDER_ID) missing.push('GOOGLE_DRIVE_FOLDER_ID');

  if (missing.length === 0) return null;

  return `Google Drive is not configured. Missing: ${missing.join(', ')}`;
}

function getDriveCtx(): DriveCtx | null {
  if (cachedCtx) return cachedCtx;

  const configError = getDriveConfigError();
  if (configError) {
    if (!didWarnMissingConfig) {
      logger.warn('drive.config.missing', { message: configError });
      didWarnMissingConfig = true;
    }
    return null;
  }

  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET
  );
  auth.setCredentials({ refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN });

  const drive = google.drive({ version: 'v3', auth });

  cachedCtx = { drive, folderId: process.env.GOOGLE_DRIVE_FOLDER_ID as string };
  return cachedCtx;
}

async function getFileId(name: string): Promise<string | null> {
  const ctx = getDriveCtx();
  if (!ctx) return null;

  const { drive, folderId } = ctx;

  const res = await drive.files.list({
    q: `'${folderId}' in parents and name='${name}.json' and trashed=false`,
    fields: 'files(id, name)',
  });

  return res.data.files?.[0]?.id ?? null;
}

function normalizeGoogleError(error: unknown): {
  message: string;
  status?: number;
  reason?: string;
  invalidGrant?: boolean;
} {
  if (!error || typeof error !== 'object') {
    return { message: 'Unknown Google API error' };
  }

  const anyError = error as {
    message?: string;
    code?: number;
    errors?: Array<{ reason?: string }>;
    error?: string;
    response?: { status?: number; data?: { error?: { errors?: Array<{ reason?: string }> } } };
  };

  const message = anyError.message ?? 'Unknown Google API error';
  const status = anyError.code ?? anyError.response?.status;
  const reason =
    anyError.errors?.[0]?.reason ?? anyError.response?.data?.error?.errors?.[0]?.reason;
  const invalidGrant =
    anyError.error === 'invalid_grant' ||
    reason === 'invalid_grant' ||
    message.toLowerCase().includes('invalid_grant');

  return { message, status, reason, invalidGrant };
}

export const driveService = {
  async getCollection<T>(name: string): Promise<T[]> {
    const ctx = getDriveCtx();
    if (!ctx) return [];

    const { drive } = ctx;

    const fileId = await getFileId(name);
    if (!fileId) return [];

    // Download the file content as text, then parse JSON safely.
    const res = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'text' });

    const raw = res.data;

    // `googleapis` typings can be loose; ensure we only parse strings.
    const text = typeof raw === 'string' ? raw : JSON.stringify(raw);

    const parsed = JSON.parse(text);

    // Expect an array; if the file has a different structure, fail gracefully.
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  },

  async saveCollection<T>(name: string, data: T[]): Promise<void> {
    const ctx = getDriveCtx();
    if (!ctx) return;

    const { drive, folderId } = ctx;

    const fileId = await getFileId(name);
    const body = JSON.stringify(data, null, 2);

    if (fileId) {
      await drive.files.update({
        fileId,
        media: {
          mimeType: 'application/json',
          body,
        },
      });
      return;
    }

    await drive.files.create({
      requestBody: {
        name: `${name}.json`,
        parents: [folderId],
        mimeType: 'application/json',
      },
      media: {
        mimeType: 'application/json',
        body,
      },
    });
  },

  async healthCheck(): Promise<{
    ok: boolean;
    folder?: { id: string; name?: string; mimeType?: string; accessible: boolean };
    folderError?: { message: string; status?: number; reason?: string };
    error?: { message: string; status?: number; reason?: string; invalidGrant?: boolean };
  }> {
    const configError = getDriveConfigError();
    if (configError) {
      return { ok: false, error: { message: configError, reason: 'missing_env' } };
    }

    const ctx = getDriveCtx();
    if (!ctx) {
      return {
        ok: false,
        error: { message: 'Google Drive is not configured', reason: 'missing_env' },
      };
    }

    try {
      await ctx.drive.files.list({ pageSize: 1, fields: 'files(id)' });

      try {
        const folderRes = await ctx.drive.files.get({
          fileId: ctx.folderId,
          fields: 'id,name,mimeType',
        });
        return {
          ok: true,
          folder: {
            id: folderRes.data.id as string,
            name: folderRes.data.name ?? undefined,
            mimeType: folderRes.data.mimeType ?? undefined,
            accessible: true,
          },
        };
      } catch (folderError) {
        const normalizedFolderError = normalizeGoogleError(folderError);
        return {
          ok: true,
          folder: { id: ctx.folderId, accessible: false },
          folderError: {
            message: normalizedFolderError.message,
            status: normalizedFolderError.status,
            reason: normalizedFolderError.reason,
          },
        };
      }
    } catch (error) {
      const normalized = normalizeGoogleError(error);
      logger.error('drive.health.failed', normalized);
      return { ok: false, error: normalized };
    }
  },
};
