import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const auth = new google.auth.OAuth2(
  process.env.GOOGLE_OAUTH_CLIENT_ID,
  process.env.GOOGLE_OAUTH_CLIENT_SECRET
);

auth.setCredentials({ refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN });

(async () => {
  const { credentials } = await auth.refreshAccessToken();
  if (!credentials.access_token) throw new Error('No access token');

  const res = await fetch(
    `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${credentials.access_token}`
  );
  const json = await res.json();
  console.log(json);
})().catch((err) => {
  console.error('Drive whoami failed:', err?.message || err);
  process.exit(1);
});
