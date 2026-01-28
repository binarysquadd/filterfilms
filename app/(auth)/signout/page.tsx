'use client';

import { useAuth } from '@/app/lib/firebase/auth-context';
import { useRouter } from 'next/navigation';

interface SignOutButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export default function SignOutButton({ className, children }: SignOutButtonProps) {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/signin');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      className={className || 'px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700'}
    >
      {children || 'Sign Out'}
    </button>
  );
}