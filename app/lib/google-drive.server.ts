import { google, type drive_v3 } from 'googleapis';

type DriveCtx = {
  drive: drive_v3.Drive;
  folderId: string;
};

let cachedCtx: DriveCtx | null = null;

function getDriveCtx(): DriveCtx {
  if (cachedCtx) return cachedCtx;

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  if (!clientId || !clientSecret || !refreshToken || !folderId) {
    throw new Error(
      'Google Drive is not configured. Missing one of: ' +
        'GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, GOOGLE_OAUTH_REFRESH_TOKEN, GOOGLE_DRIVE_FOLDER_ID'
    );
  }

  const auth = new google.auth.OAuth2(clientId, clientSecret);
  auth.setCredentials({ refresh_token: refreshToken });

  const drive = google.drive({ version: 'v3', auth });

  cachedCtx = { drive, folderId };
  return cachedCtx;
}

async function getFileId(name: string): Promise<string | null> {
  const { drive, folderId } = getDriveCtx();

  const res = await drive.files.list({
    q: `'${folderId}' in parents and name='${name}.json' and trashed=false`,
    fields: 'files(id, name)',
  });

  if (!res.ok) {
    console.log('Google Drive Refresh Token may have expired or is invalid.');
  }

  return res.data.files?.[0]?.id ?? null;
}

export const driveService = {
  async getCollection<T>(name: string): Promise<T[]> {
    const { drive } = getDriveCtx();

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
    const { drive, folderId } = getDriveCtx();

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
};
