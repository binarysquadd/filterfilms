'use client';

import { useState } from 'react';
import { useAuth } from '@/app/lib/firebase/auth-context';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

type FirebaseAuthError = {
  code?: string;
  message?: string;
};

function isFirebaseAuthError(err: unknown): err is FirebaseAuthError {
  return typeof err === 'object' && err !== null && ('code' in err || 'message' in err);
}

function getDashboardByRole(role: string): string {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'team':
      return '/team/dashboard';
    case 'customer':
      return '/customer/dashboard';
    default:
      return '/customer/dashboard';
  }
}

export default function SignInForm({ callbackUrl }: { callbackUrl?: string }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { signInWithEmail, signInWithGoogle } = useAuth();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEmailLoading(true);

    try {
      await signInWithEmail(email, password);

      // Wait for auth context to update
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Get the session to retrieve user role
      const response = await fetch('/api/auth/session');
      if (response.ok) {
        const { user } = await response.json();
        const redirectUrl = callbackUrl || getDashboardByRole(user?.role || 'customer');
        window.location.href = redirectUrl;
      } else {
        // Fallback to customer dashboard if session check fails
        window.location.href = callbackUrl || '/customer/dashboard';
      }
    } catch (err: unknown) {
      console.error('Sign in error:', err);
      toast.error('Sign in failed. Please try again.');

      if (isFirebaseAuthError(err)) {
        if (err.code === 'auth/user-not-found') {
          setError('No account found with this email');
          return;
        }
        if (err.code === 'auth/wrong-password') {
          setError('Incorrect password');
          return;
        }
        if (err.code === 'auth/invalid-email') {
          setError('Invalid email address');
          return;
        }
        if (err.code === 'auth/invalid-credential') {
          setError('Invalid email or password');
          return;
        }
        if (err.code === 'auth/too-many-requests') {
          setError('Too many failed attempts. Please try again later');
          return;
        }

        setError(err.message || 'Failed to sign in');
        return;
      }

      setError('Failed to sign in');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);

    try {
      await signInWithGoogle();

      // Wait for auth context to update
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Get the session to retrieve user role
      const response = await fetch('/api/auth/session');
      if (response.ok) {
        const { user } = await response.json();
        const redirectUrl = callbackUrl || getDashboardByRole(user?.role || 'customer');
        window.location.href = redirectUrl;
      } else {
        // Fallback to customer dashboard if session check fails
        window.location.href = callbackUrl || '/customer/dashboard';
      }
    } catch (err: unknown) {
      console.error('Google sign in error:', err);
      toast.error('Sign in with Google failed. Please try again.');

      if (isFirebaseAuthError(err)) {
        if (err.code === 'auth/popup-closed-by-user') {
          setError('Sign in cancelled');
          return;
        }
        if (err.code === 'auth/popup-blocked') {
          setError('Popup blocked. Please allow popups for this site');
          return;
        }
        setError(err.message || 'Failed to sign in with Google');
        return;
      }

      setError('Failed to sign in with Google');
    } finally {
      setGoogleLoading(false);
    }
  };

  const anyLoading = emailLoading || googleLoading;

  return (
    <div className="w-full max-w-md mx-auto p-8">
      <h2 className="text-2xl font-bold text-emerald mb-2">Sign In</h2>
      <p className="text-muted-foreground mb-6 text-md font-bold tracking-normal">
        Welcome back! Please sign in.
      </p>

      {error && <div className="mb-4 text-sm text-destructive">{error}</div>}

      <form onSubmit={handleSignIn} className="space-y-2">
        <div>
          <Label htmlFor="email" className="block text-lg font-bold text-muted-foreground mb-1">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full px-3 py-2 border border-muted-foreground focus:border-emerald focus:ring-emerald focus:outline-none"
          />
        </div>

        <div>
          <Label htmlFor="password" className="block text-lg font-bold text-muted-foreground mb-1">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full px-3 py-2 border border-muted-foreground focus:border-emerald focus:ring-emerald focus:outline-none"
          />
        </div>

        <Button
          type="submit"
          variant="royal"
          className="w-full py-2.5 rounded text-md font-bold transition-colors mt-4"
          disabled={anyLoading}
        >
          {emailLoading ? <Loader2 className="animate-spin w-4 h-4 mx-auto" /> : 'Sign In'}
        </Button>
      </form>

      <div className="text-center my-5 text-md font-bold tracking-normal">Or continue with</div>

      <Button
        type="button"
        variant="elegant"
        className="w-full py-2.5 border transition-colors flex items-center justify-center gap-3 text-ivory"
        disabled={anyLoading}
        onClick={handleGoogleSignIn}
      >
        {googleLoading ? (
          <Loader2 className="animate-spin w-4 h-4 mx-auto text-gold" />
        ) : (
          <>
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M17.64 9.20443C17.64 8.56625 17.5827 7.95262 17.4764 7.36353H9V10.8449H13.8436C13.635 11.9699 13.0009 12.9231 12.0477 13.5613V15.8194H14.9564C16.6582 14.2526 17.64 11.9453 17.64 9.20443Z"
                fill="#4285F4"
              />
              <path
                d="M8.99976 18C11.4298 18 13.467 17.1941 14.9561 15.8195L12.0475 13.5613C11.2416 14.1013 10.2107 14.4204 8.99976 14.4204C6.65567 14.4204 4.67158 12.8372 3.96385 10.71H0.957031V13.0418C2.43794 15.9831 5.48158 18 8.99976 18Z"
                fill="#34A853"
              />
              <path
                d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.82999 3.96409 7.28999V4.95818H0.957273C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957273 13.0418L3.96409 10.71Z"
                fill="#FBBC05"
              />
              <path
                d="M8.99976 3.57955C10.3211 3.57955 11.5075 4.03364 12.4402 4.92545L15.0216 2.34409C13.4629 0.891818 11.4257 0 8.99976 0C5.48158 0 2.43794 2.01682 0.957031 4.95818L3.96385 7.29C4.67158 5.16273 6.65567 3.57955 8.99976 3.57955Z"
                fill="#EA4335"
              />
            </svg>
            <span className="text-black hover:text-ivory-dark font-medium">
              Continue with Google
            </span>
          </>
        )}
      </Button>

      <div className="flex justify-between items-center text-md mt-5">
        <Link href="/forgot-password" className="text-emerald hover:underline">
          Forgot password?
        </Link>
        <Link href="/signup" className="text-emerald hover:underline">
          Create account
        </Link>
      </div>
    </div>
  );
}
