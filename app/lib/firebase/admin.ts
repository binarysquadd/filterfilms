// lib/firebase/admin.ts (Server-side Firebase Admin)
import {
  initializeApp as initializeAdminApp,
  getApps as getAdminApps,
  cert,
} from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';

const adminConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
};

const adminApp = getAdminApps().length === 0 ? initializeAdminApp(adminConfig) : getAdminApps()[0];
export const adminAuth = getAdminAuth(adminApp);
