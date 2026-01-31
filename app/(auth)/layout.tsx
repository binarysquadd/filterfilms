import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex bg-white overflow-hidden">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-emerald-800 px-12 py-8 flex-col justify-between relative overflow-hidden">
        {/* Back Button */}
        <Link
          href="/"
          className="absolute top-6 left-6 z-20 inline-flex items-center gap-2 text-ivory/80 hover:text-ivory transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Back</span>
        </Link>

        {/* Centered Logo Content */}
        <div className="relative z-10 flex flex-col items-center justify-center flex-1 text-center">
          <Image
            src="/logo/white-logo.png"
            alt="Filter Film Studio Logo"
            width={260}
            height={120}
            priority
            className="object-contain w-full h-auto mb-8"
          />
        </div>
      </div>

      {/* Right Side - Auth Forms */}
      <div className="w-full lg:w-1/2 flex flex-col bg-ivory justify-center">
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-md">
            {/* Child Pages Render */}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
