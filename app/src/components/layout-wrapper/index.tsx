'use client';

import { usePathname } from 'next/navigation';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import WhatsAppButton from '../common/WhatsAppButton';

const HIDE_LAYOUT_ROUTES = [
  '/admin',
  '/team',
  '/customer',
  '/signin',
  '/signup',
  '/forgot-password',
];

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const hideLayout = HIDE_LAYOUT_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  return (
    <>
      {!hideLayout && <Navbar />}
      {children}
      {!hideLayout && <WhatsAppButton />}
      {!hideLayout && <Footer />}
    </>
  );
}
