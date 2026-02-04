# CLI Verification

Purpose: Verify credentials and access without using UI.

Pre-reqs:

- Install `gcloud` and `firebase-tools` locally.
- Login with `gcloud auth login --no-launch-browser`.

Checks:

- Drive API enabled:
  - `gcloud services list --enabled | grep drive`
- Firebase project list:
  - `firebase projects:list`
- Vercel env keys present:
  - `vercel env ls --cwd . | rg "GOOGLE_OAUTH|GOOGLE_DRIVE|FIREBASE_ADMIN"`
- Drive access:
  - `node ./debug/drive-check.js`
