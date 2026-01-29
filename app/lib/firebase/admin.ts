// lib/firebase/admin.ts (Server-side Firebase Admin)
import {
  initializeApp as initializeAdminApp,
  getApps as getAdminApps,
  cert,
  App as AdminApp,
} from 'firebase-admin/app';
import { getAuth as getAdminAuth, Auth } from 'firebase-admin/auth';

let cachedApp: AdminApp | null = null;

function getAdminApp(): AdminApp {
  if (cachedApp) return cachedApp;

  const apps = getAdminApps();
  if (apps.length > 0) {
    cachedApp = apps[0]!;
    return cachedApp;
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKeyRaw = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  // ✅ Don't crash at import time; only crash when actually used
  if (!projectId || !clientEmail || !privateKeyRaw) {
    throw new Error(
      'Firebase Admin is not configured. Missing one of: ' +
        'FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY'
    );
  }

  const privateKey = privateKeyRaw.replace(/\\n/g, '\n');

  cachedApp = initializeAdminApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });

  return cachedApp;
}

export function getAdminAuthClient(): Auth {
  return getAdminAuth(getAdminApp());
}
