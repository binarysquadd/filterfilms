# CLI Auth (SSH Tunneling)

This doc captures how CLI auth was completed on a remote server using SSH tunnels.

## Vercel CLI

- Run `vercel login` or `vercel link` on the server.
- Use device auth when prompted.

## GCloud CLI

- Use device-code flow (no browser on server):
  - `gcloud auth login --no-launch-browser`
- Open the URL on your local machine and paste the code back.

## Firebase CLI

- When it opens a localhost callback on the server (e.g., port 9005), create a tunnel:
  - `ssh -L 9005:localhost:9005 phoenix-admin@100.64.11.64`
- Open the provided `http://localhost:9005/...` URL on your local browser.

## OAuth Refresh Token (Drive)

- Uses `scripts/drive-auth-once.ts` with localhost callback on port 4444.
- Create a tunnel first:
  - `ssh -L 4444:localhost:4444 phoenix-admin@100.64.11.64`
- Run:
  - `npx tsx ./scripts/drive-auth-once.ts`
- Complete consent in local browser and copy the refresh token.
