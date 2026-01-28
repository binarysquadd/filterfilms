'use client';

import { useState } from 'react';
import { useAuth } from '@/app/lib/firebase/auth-context';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

function getDashboardByRole(role: string): string {
  switch (role) {
    case 'admin': return '/admin/dashboard';
    case 'team': return '/team/dashboard';
    case 'customer': return '/customer/dashboard';
    default: return '/customer/dashboard';
  }
}

export default function SignUpForm({ callbackUrl }: { callbackUrl?: string }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { signUpWithEmail, signInWithGoogle } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      toast.error('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      toast.error('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Invalid email address');
      toast.error('Invalid email address');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      toast.error('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      toast.error('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;

    setEmailLoading(true);

    try {
      await signUpWithEmail(formData.email, formData.password, formData.name);

      // Wait for auth context to update
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Get the session to retrieve user role
      const response = await fetch('/api/auth/session');
      if (response.ok) {
        const { user } = await response.json();
        const redirectUrl = callbackUrl || getDashboardByRole(user?.role || 'customer');
        toast.success('Account created successfully!');
        window.location.href = redirectUrl;
      } else {
        // Fallback to customer dashboard if session check fails
        toast.success('Account created successfully!');
        window.location.href = callbackUrl || '/customer/dashboard';
      }
    } catch (err: any) {
      console.error('Sign up error:', err);

      let errorMessage = 'Failed to create account';

      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already in use. Please sign in instead.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Use at least 6 characters';
      } else if (err.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/password sign up is not enabled';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      toast.error(errorMessage);
      setEmailLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setGoogleLoading(true);

    try {
      await signInWithGoogle();

      // Wait for auth context to update
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Get the session to retrieve user role
      const response = await fetch('/api/auth/session');
      if (response.ok) {
        const { user } = await response.json();
        const redirectUrl = callbackUrl || getDashboardByRole(user?.role || 'customer');
        toast.success('Signed up successfully!');
        window.location.href = redirectUrl;
      } else {
        // Fallback to customer dashboard if session check fails
        toast.success('Signed up successfully!');
        window.location.href = callbackUrl || '/customer/dashboard';
      }
    } catch (err: any) {
      console.error('Google sign up error:', err);

      let errorMessage = 'Failed to sign up with Google';

      if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign up cancelled';
      } else if (err.code === 'auth/popup-blocked') {
        errorMessage = 'Popup blocked. Please allow popups for this site';
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'An account already exists with this email using a different sign-in method';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      toast.error(errorMessage);
      setGoogleLoading(false);
    }
  };

  const anyLoading = emailLoading || googleLoading;

  return (
    <div className="w-full max-w-lg mx-auto p-8">
      <h2 className="text-2xl font-bold text-emerald mb-2">Create Account</h2>
      <p className="text-muted-foreground mb-6 text-md font-bold">
        Sign up to get started.
      </p>

      {error && (
        <div className="mb-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSignUp} className="grid grid-cols-1 md:grid-cols-2 gap-1">
        {/* Full Name */}
        <div className="md:col-span-2">
          <Label htmlFor="name" className="block text-lg font-bold text-muted-foreground mb-1">
            Full Name
          </Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            required
            className="w-full border border-muted-foreground focus:border-emerald focus:ring-emerald"
          />
        </div>

        {/* Email */}
        <div className="md:col-span-2">
          <Label htmlFor="email" className="block text-lg font-bold text-muted-foreground mb-1">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
            className="w-full border border-muted-foreground focus:border-emerald focus:ring-emerald"
          />
        </div>

        {/* Password */}
        <div>
          <Label htmlFor="password" className="block text-lg font-bold text-muted-foreground mb-1">
            Password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
            className="w-full border border-muted-foreground focus:border-emerald focus:ring-emerald"
          />
        </div>

        {/* Confirm Password */}
        <div>
          <Label htmlFor="confirmPassword" className="block text-lg font-bold text-muted-foreground mb-1">
            Confirm Password
          </Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            required
            className="w-full border border-muted-foreground focus:border-emerald focus:ring-emerald"
          />
        </div>

        {/* Submit Button */}
        <div className="md:col-span-2 mt-2">
          <Button
            type="submit"
            variant="royal"
            className="w-full py-2.5 text-md font-bold"
            disabled={anyLoading}
          >
            {emailLoading ? <Loader2 className="animate-spin w-4 h-4 mx-auto" /> : 'Create Account'}
          </Button>
        </div>
      </form>

      {/* Divider */}
      <div className="text-center my-5 text-md font-bold">Or continue with</div>

      {/* Google Button */}
      <Button
        type="button"
        variant="elegant"
        className="w-full py-2.5 flex items-center justify-center gap-3"
        onClick={handleGoogleSignUp}
        disabled={anyLoading}
      >
        {googleLoading ? (
          <Loader2 className="animate-spin w-4 h-4 text-gold" />
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M17.64 9.20443C17.64 8.56625 17.5827 7.95262 17.4764 7.36353H9V10.8449H13.8436C13.635 11.9699 13.0009 12.9231 12.0477 13.5613V15.8194H14.9564C16.6582 14.2526 17.64 11.9453 17.64 9.20443Z" fill="#4285F4" />
              <path d="M8.99976 18C11.4298 18 13.467 17.1941 14.9561 15.8195L12.0475 13.5613C11.2416 14.1013 10.2107 14.4204 8.99976 14.4204C6.65567 14.4204 4.67158 12.8372 3.96385 10.71H0.957031V13.0418C2.43794 15.9831 5.48158 18 8.99976 18Z" fill="#34A853" />
              <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.82999 3.96409 7.28999V4.95818H0.957273C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957273 13.0418L3.96409 10.71Z" fill="#FBBC05" />
              <path d="M8.99976 3.57955C10.3211 3.57955 11.5075 4.03364 12.4402 4.92545L15.0216 2.34409C13.4629 0.891818 11.4257 0 8.99976 0C5.48158 0 2.43794 2.01682 0.957031 4.95818L3.96385 7.29C4.67158 5.16273 6.65567 3.57955 8.99976 3.57955Z" fill="#EA4335" />
            </svg>
            <span className="font-medium">Continue with Google</span>
          </>
        )}
      </Button>

      <div className="text-center text-md mt-5">
        Already have an account?{' '}
        <Link href="/signin" className="text-emerald hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}