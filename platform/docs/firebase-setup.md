# Firebase Setup

Steps:

1. Create a new Firebase project.
2. Project Settings → General → add a Web App and capture config.
3. Build → Authentication → Get Started.
4. Configure sign-in providers under Sign-in method.
5. Add authorized domains (custom domain + Vercel domain).

Admin SDK:

- Create or reuse a service account with Firebase Admin roles.
- Store credentials in `platform/creds/firebase-admin.sops.json` (encrypted).
