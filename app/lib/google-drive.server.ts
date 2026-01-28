import 'dotenv/config';
import { google } from 'googleapis';

if (
  !process.env.GOOGLE_OAUTH_CLIENT_ID ||
  !process.env.GOOGLE_OAUTH_CLIENT_SECRET ||
  !process.env.GOOGLE_OAUTH_REFRESH_TOKEN ||
  !process.env.GOOGLE_DRIVE_FOLDER_ID
) {
  throw new Error('Missing Google Drive environment variables');
}

const auth = new google.auth.OAuth2(
  process.env.GOOGLE_OAUTH_CLIENT_ID,
  process.env.GOOGLE_OAUTH_CLIENT_SECRET
);

auth.setCredentials({
  refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN,
});

const drive = google.drive({
  version: 'v3',
  auth,
});

async function getFileId(name: string): Promise<string | null> {
  const res = await drive.files.list({
    q: `'${process.env.GOOGLE_DRIVE_FOLDER_ID}' in parents and name='${name}.json' and trashed=false`,
    fields: 'files(id, name)',
  });

  return res.data.files?.[0]?.id ?? null;
}

export const driveService = {
  async getCollection<T>(name: string): Promise<T[]> {
    const fileId = await getFileId(name);
    if (!fileId) return [];

    const res = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'json' });

    // Drive API returns unknown JSON; we trust the caller-provided T here.
    return res.data as T[];
  },

  async saveCollection<T>(name: string, data: T[]): Promise<void> {
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
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID!],
        mimeType: 'application/json',
      },
      media: {
        mimeType: 'application/json',
        body,
      },
    });
  },
};
