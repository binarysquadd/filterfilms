'use client';

import React, { useState, useEffect } from 'react';
import {
  Menu,
  X,
  Home,
  Package,
  Calendar,
  Users,
  LogOut,
  User,
  ChevronRight,
  Loader2,
  Globe,
  ClipboardCheck,
  UserSearch,
  MailOpenIcon,
  ImageIcon,
  Clock,
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/lib/firebase/auth-context';

// Navigation items for different roles
const navigationConfig = {
  admin: [
    { href: '/admin/dashboard', label: 'Dashboard', icon: Home },
    { href: '/admin/packages', label: 'Manage Packages', icon: Package },
    { href: '/admin/bookings', label: 'Manage Bookings', icon: Calendar },
    { href: '/admin/gallery', label: 'Manage Gallery', icon: ImageIcon },
    { href: '/admin/team', label: 'Manage Team', icon: Users },
    { href: '/admin/customers', label: 'Customers', icon: UserSearch },
    { href: '/admin/attendance', label: 'Attendance', icon: ClipboardCheck },
    { href: '/admin/payments', label: 'Team Payments', icon: Clock },
    { href: '/admin/messages', label: 'Messages', icon: MailOpenIcon },
    { href: '/admin/profile', label: 'Profile', icon: User },
  ],
  customer: [
    { href: '/customer/dashboard', label: 'Dashboard', icon: Home },
    { href: '/customer/packages', label: 'Browse Packages', icon: Package },
    { href: '/customer/bookings', label: 'My Bookings', icon: Calendar },
    { href: '/customer/profile', label: 'Profile', icon: User },
  ],
  team: [
    { href: '/team/dashboard', label: 'Dashboard', icon: Home },
    { href: '/team/assignments', label: 'My Assignments', icon: Calendar },
    { href: '/team/attendance', label: 'Attendance', icon: ClipboardCheck },
    { href: '/team/payments', label: 'Payments History', icon: Clock },
    { href: '/team/profile', label: 'Profile', icon: User },
  ],
};

const roleConfig = {
  admin: {
    title: 'Admin Panel',
    color: 'purple',
    bgClass: 'bg-purple-100',
    textClass: 'text-purple-800',
    primaryClass: 'bg-purple-500',
    hoverClass: 'hover:bg-purple-50',
    activeBorder: 'border-purple-500',
  },
  customer: {
    title: 'Customer Portal',
    color: 'green',
    bgClass: 'bg-green-100',
    textClass: 'text-green-800',
    primaryClass: 'bg-green-500',
    hoverClass: 'hover:bg-green-50',
    activeBorder: 'border-green-500',
  },
  team: {
    title: 'Team Portal',
    color: 'blue',
    bgClass: 'bg-blue-100',
    textClass: 'text-blue-800',
    primaryClass: 'bg-blue-500',
    hoverClass: 'hover:bg-blue-50',
    activeBorder: 'border-blue-500',
  },
};

interface UnifiedDashboardProps {
  children: React.ReactNode;
}

const UnifiedDashboard: React.FC<UnifiedDashboardProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Derived values from user
  const role = user?.role;

  // Handle redirect in useEffect to avoid render-time navigation
  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
    }
  }, [loading, user, router]);

  // Don't render anything while redirecting
  if (loading || !user || !role) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-muted-foreground mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  const navItems = navigationConfig[role];
  const config = roleConfig[role];

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/signin');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gradient-elegant">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 lg:translate-x-0 lg:static flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Logo Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border flex-shrink-0">
          <div className="h-10 w-auto flex items-center">
            {/* Page title (optional, can be customized per page) */}
            <div className="">
              <h1 className="text-xl font-bold text-gray-900">{config.title}</h1>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  href={item.href}
                  key={item.label}
                  onClick={() => setSidebarOpen(false)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? `bg-primary text-primary-foreground`
                      : `text-muted-foreground hover:bg-muted hover:text-foreground`
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="flex-1 text-left truncate font-bold text-base">
                    {item.label}
                  </span>
                  {isActive && <ChevronRight className="w-4 h-4 flex-shrink-0" />}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom Actions - Compact Icon Style */}
        <div className="p-3 border-t border-border bg-card flex-shrink-0">
          <div className="flex items-center justify-around gap-2">
            <button
              onClick={() => router.push('/')}
              className="flex-1 flex flex-col items-center gap-1 px-2 py-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors group"
              title="Back to Website"
            >
              <Globe className="w-5 h-5 flex-shrink-0" />
              <span className="text-xs font-medium">Website</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex-1 flex flex-col items-center gap-1 px-2 py-2 text-destructive hover:bg-red-50 rounded-lg transition-colors group"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <span className="text-xs font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Desktop Header with User Info */}
        <header className="h-16 bg-card border-b border-border px-4 lg:px-8 flex items-center justify-between shadow-sm flex-shrink-0">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>

          {/* Mobile spacer */}
          <div className="lg:hidden w-10" />
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto bg-card">
          <div className="p-6 lg:p-8">
            {children || (
              <div>
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Welcome Back, {user.name || user.email?.split('@')[0]}!
                  </h1>
                  <p className="text-gray-600">Here&apos;s your dashboard overview.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-card rounded-lg shadow p-6 border border-border hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-popover-foreground">Dashboard</h3>
                      <Home className="w-5 h-5 text-popover-foreground" />
                    </div>
                    <p className="text-popover-foreground text-sm">Your main dashboard content</p>
                  </div>

                  <div className="bg-card rounded-lg shadow p-6 border border-border hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-popover-foreground">Statistics</h3>
                      <Package className="w-5 h-5 text-popover-foreground" />
                    </div>
                    <p className="text-popover-foreground text-sm">
                      View your analytics and metrics
                    </p>
                  </div>

                  <div className="bg-card rounded-lg shadow p-6 border border-border hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-popover-foreground">Quick Actions</h3>
                      <Calendar className="w-5 h-5 text-popover-foreground" />
                    </div>
                    <p className="text-popover-foreground text-sm">Perform common tasks quickly</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default UnifiedDashboard;
