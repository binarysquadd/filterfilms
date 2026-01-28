// app/src/components/AuthLayout.tsx
'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/app/lib/firebase/auth-context';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
