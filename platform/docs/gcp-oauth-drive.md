# GCP OAuth + Drive

Purpose: Generate refresh tokens and verify Drive access.

OAuth consent screen:

- External user
- Set app name + support email
- Add test users if in Testing

OAuth client:

- Authorized redirect URIs: `http://localhost:4444/oauth2callback`
- Authorized JS origins: `http://localhost:4444`

Refresh token generation (full Drive scope):

- `scripts/drive-auth-once.ts` uses `https://www.googleapis.com/auth/drive`
- If running on a remote server, create an SSH tunnel:
  - `ssh -L 4444:localhost:4444 phoenix-admin@100.64.11.64`

Access checks:

- `node ./debug/drive-check.js`
- `node ./debug/drive-whoami.js`

Common failure:

- `File not found` usually means wrong folder ID or wrong OAuth account.

Remote OAuth callback (VS Code server):

1. Run the auth script on the server:
   - `npx tsx ./scripts/drive-auth-once.ts`
2. Open the consent URL in your local browser.
3. Callback hits `http://localhost:4444/oauth2callback` via SSH tunnel.

Optional proxy-based alternative:

- Use a proxy callback such as:
  - `http://100.64.11.64:8081/proxy/4444/oauth2callback`
- Update OAuth client redirect URI and script if using this path.

Future automation idea:

- Use `gcloud` to create/update OAuth clients and set redirect URIs,
  then generate refresh tokens via a dedicated service account or manual flow.
