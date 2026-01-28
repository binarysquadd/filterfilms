import { google } from 'googleapis';
import open from 'open';
import http from 'http';
import 'dotenv/config';
import fs from 'fs';

const PORT = 4444;
const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`;

const oauth2Client = new google.auth.OAuth2(
  process.env.AUTH_GOOGLE_ID,
  process.env.AUTH_GOOGLE_SECRET,
  REDIRECT_URI
);

const server = http.createServer(async (req, res) => {
  if (!req.url?.startsWith('/oauth2callback')) return;

  const url = new URL(req.url, REDIRECT_URI);
  const code = url.searchParams.get('code');

  if (!code) {
    res.end('No code');
    return;
  }

  const { tokens } = await oauth2Client.getToken(code);

  fs.writeFileSync('drive-tokens.json', JSON.stringify(tokens, null, 2));

  res.end('✅ ACCESS TOKEN saved. You can close this tab.');
  server.close();

  console.log('✅ Refresh token obtained');
  console.log(tokens);
});

server.listen(PORT, async () => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent', // REQUIRED ONLY THIS ONCE
    scope: ['https://www.googleapis.com/auth/drive.file'],
  });

  console.log('Opening browser once...');
  await open(authUrl);
});
