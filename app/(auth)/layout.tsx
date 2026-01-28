import { Check, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex bg-white overflow-hidden">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-emerald-800 px-12 py-8 flex-col justify-between relative overflow-hidden"> 

        {/* Logo and Main Content */}
        <div className="relative z-10 flex flex-col justify-center flex-1">
          <div className="mb-8">
            <Link href="/" className="w-40 h-24 rounded flex flex-row items-center justify-center mb-10">
              <Image
                src="/logo/logo-white.png"
                alt="Filter Film Studio Logo"
                width={120}
                height={48}
                className="object-contain w-40 h-24"
              />
            </Link>

            <h2 className="text-4xl font-bold text-ivory leading-tight mb-4">
              Bring Your Vision<br />to Life
            </h2>
            <p className="text-ivory/80 text-base leading-relaxed max-w-md">
              Join our platform to access premium film production services, manage your projects, and collaborate with industry professionals.
            </p>
          </div>

          {/* Features */}
          <div className="flex flex-col justify-between items-center">
            <div className="flex flex-wrap gap-3 mt-8">
              {[
                'Professional team management',
                'Real-time project tracking',
                'Secure booking system'
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-white/90">
                  <div className="w-9 h-9 bg-white/10 rounded flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-sm">{feature}</p>
                </div>
              ))}
            </div>
            {/* Footer */}
            <div className="py-4 text-center text-md text-ivory/80">
              <p>&copy; {new Date().getFullYear()} Filter Film Studio. All rights reserved.</p>
              <div className="flex items-center justify-center gap-3 mt-1.5">
                <a href="#" className="hover:text-ivory transition-colors">Privacy</a>
                <span>•</span>
                <a href="#" className="hover:text-ivory transition-colors">Terms</a>
                <span>•</span>
                <a href="#" className="hover:text-ivory transition-colors">Help</a>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-700/30 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-900/30 rounded-full blur-3xl -ml-48 -mb-48"></div>
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