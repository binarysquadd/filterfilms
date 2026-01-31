'use client';

import { useState, useRef, useEffect } from 'react';
import { Menu, X, User, Loader, ChevronDown, LogOut, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button } from '../ui/button';
import { cn } from '@/app/lib/utils';
import { useAuth } from '@/app/lib/firebase/auth-context';

const navLinksLeft = [
  { href: '/#home', label: 'Home' },
  { href: '/#about', label: 'About' },
  { href: '/#packages', label: 'Packages' },
];

const navLinksRight = [
  { href: '/#team', label: 'Our Founder' },
  { href: '/#gallery', label: 'Gallery' },
  { href: '/#contact', label: 'Contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();

  // ✅ Correct typing
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // ✅ Click outside handler (safe)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target;
      if (dropdownRef.current && target instanceof Node && !dropdownRef.current.contains(target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDashboardLink = () => {
    if (!user?.role) return '/signin';

    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'team':
        return '/team/dashboard';
      case 'customer':
        return '/customer/dashboard';
      default:
        return '/signin';
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const isAuthenticated = !!user;

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <nav className="container mx-auto px-6 py-1">
        {/* ================= Desktop ================= */}
        <div className="hidden lg:flex items-center justify-evenly h-20 relative">
          {/* Left Links */}
          <div className="flex items-center gap-6">
            {navLinksLeft.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-bold uppercase tracking-wider transition-colors',
                  pathname === link.href
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Center Logo */}
          <Link href="/" className="">
            <Image
              src="/logo/logo.png"
              alt="Filter Film Studio Logo"
              width={180}
              height={60}
              className="object-contain w-28 hover:scale-105 transition-transform"
            />
          </Link>

          {/* Right Links + Auth */}
          <div className="flex items-center gap-6">
            {navLinksRight.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-bold uppercase tracking-wider transition-colors',
                  pathname === link.href
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {link.label}
              </Link>
            ))}

            {/* Auth Section */}
            <div className="absolute top-1/2 right-0 transform -translate-y-1/2">
              {loading ? (
                <Loader className="w-5 h-5 animate-spin text-primary" />
              ) : isAuthenticated ? (
                <div className="relative" ref={dropdownRef}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full gap-2"
                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                  >
                    <span className="">{user?.name}</span>
                    <ChevronDown
                      className={cn('w-4 h-4 transition-transform', isDropdownOpen && 'rotate-180')}
                    />
                  </Button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-52 bg-background border border-border rounded-xl shadow-xl overflow-hidden z-50">
                      <Link
                        href={getDashboardLink()}
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsDropdownOpen(false);
                        }}
                        className="flex items-center gap-3 px-4 py-3 text-sm w-full text-left hover:bg-destructive/10 text-destructive"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/signin">
                  <Button variant="outline" size="sm" className="rounded-full">
                    <User className="w-4 h-4 mr-2" />
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ================= Mobile ================= */}
        <div className="lg:hidden flex items-center justify-between h-20">
          <Link href="/">
            <Image
              src="/logo/logo.png"
              alt="Filter Film Studio Logo"
              width={140}
              height={40}
              className="object-contain w-32"
            />
          </Link>

          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="p-3 rounded-xl hover:bg-muted"
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>

        {isOpen && (
          <div className="lg:hidden py-6 space-y-3 border-t border-border">
            {[...navLinksLeft, ...navLinksRight].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 rounded-xl text-sm font-semibold uppercase tracking-wider hover:bg-muted"
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-4 border-t border-border">
              {isAuthenticated ? (
                <>
                  <Link href={getDashboardLink()} onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <LayoutDashboard className="mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <Link href="/signin" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
