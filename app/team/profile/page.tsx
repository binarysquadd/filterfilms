'use client';

import Image from 'next/image';
import { ShieldCheck, Mail, User } from 'lucide-react';
import { useAuth } from '@/app/lib/firebase/auth-context';

const TeamProfile = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground">View your account information and role.</p>
      </div>

      {/* Profile Card */}
      <div className="bg-card p-8 max-w-3xl">
        {/* Top Section */}
        <div className="flex items-center gap-6 border-b border-border pb-6">
          <div className="relative w-24 h-24 rounded-full overflow-hidden bg-muted">
            {user?.image ? (
              <Image src={user.image} alt={user.name || 'Team'} fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-3xl font-semibold text-muted-foreground">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-foreground">{user?.name}</h2>
            <div className="flex items-center gap-2 mt-1 text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span>{user?.email}</span>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
          {/* Name */}
          <div className="flex items-center gap-4">
            <User className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Full Name</p>
              <p className="font-medium text-foreground">{user?.name}</p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center gap-4">
            <Mail className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Email Address</p>
              <p className="font-medium text-foreground">{user?.email}</p>
            </div>
          </div>

          {/* Role */}
          <div className="flex items-center gap-4">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Role</p>
              <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                {user?.role}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamProfile;
