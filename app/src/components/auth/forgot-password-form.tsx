'use client';

import { useState } from 'react';
import { useAuth } from '@/app/lib/firebase/auth-context';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  // Firebase auth error mapper
  const getAuthErrorMessage = (error: any) => {
    switch (error.code) {
      case 'auth/user-not-found':
        return 'No account found with this email';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/too-many-requests':
        return 'Too many requests. Please try again later';
      default:
        return error.message || 'Failed to send reset email';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Email is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      toast.success('Reset link sent! Check your inbox.');
      setEmail('');
    } catch (err: any) {
      toast.error(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8">
      <h2 className="text-2xl font-bold text-emerald mb-2">Reset Password</h2>
      <p className="text-muted-foreground mb-6 text-md font-bold">
        Enter your email to receive a reset link.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label
            htmlFor="email"
            className="block text-lg font-bold text-muted-foreground mb-1"
          >
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full border border-muted-foreground focus:border-emerald focus:ring-emerald"
          />
        </div>

        <Button
          type="submit"
          variant="royal"
          className="w-full py-2.5 text-md font-bold"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="animate-spin w-4 h-4 mx-auto" />
          ) : (
            'Send Reset Link'
          )}
        </Button>
      </form>

      <div className="mt-6 flex justify-between text-md">
        <Link href="/signin" className="text-emerald hover:underline">
          Back to Sign In
        </Link>
        <Link href="/signup" className="text-emerald hover:underline">
          Create Account
        </Link>
      </div>
    </div>
  );
}
