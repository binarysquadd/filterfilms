import { google } from 'googleapis';
import 'dotenv/config';

async function main() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.AUTH_GOOGLE_ID,
    process.env.AUTH_GOOGLE_SECRET,
    'http://localhost:4444/oauth2callback' // not used in keep-alive
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN,
  });

  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  // Minimal call just to exercise the token refresh path
  const res = await drive.files.list({ pageSize: 1, fields: 'files(id)' });
  console.log('✅ keep-alive ok', res.data.files?.[0]?.id ?? '(no files)');
}

main().catch((e) => {
  console.error('❌ keep-alive failed', e?.message || e);
  console.log('REFRESH TOKEN PRESENT:', !!process.env.GOOGLE_DRIVE_REFRESH_TOKEN);
  console.log('CLIENT ID PRESENT:', !!process.env.AUTH_GOOGLE_ID);
  console.log('CLIENT SECRET PRESENT:', !!process.env.AUTH_GOOGLE_SECRET);

  process.exit(1);
});
