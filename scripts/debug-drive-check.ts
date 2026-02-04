import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const auth = new google.auth.OAuth2(
  process.env.GOOGLE_OAUTH_CLIENT_ID,
  process.env.GOOGLE_OAUTH_CLIENT_SECRET
);

auth.setCredentials({ refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN });

const drive = google.drive({ version: 'v3', auth });

(async () => {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!folderId) {
    throw new Error('Missing GOOGLE_DRIVE_FOLDER_ID');
  }

  const folderRes = await drive.files.get({ fileId: folderId, fields: 'id,name' });
  console.log('Folder:', folderRes.data.id, folderRes.data.name);

  const usersRes = await drive.files.list({
    q: `'${folderId}' in parents and name='users.json' and trashed=false`,
    fields: 'files(id,name)',
  });

  console.log('users.json:', usersRes.data.files);
})().catch((err) => {
  console.error('Drive check failed:', err?.message || err);
  if (err?.response?.data) console.error('Details:', JSON.stringify(err.response.data));
  process.exit(1);
});
