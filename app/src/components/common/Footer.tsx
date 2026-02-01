import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Facebook, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-ivory text-emerald-dark">
      {/* Top Accent Line */}
      <div className="h-[2px] bg-gradient-to-r from-emerald via-gold to-emerald" />

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            {/* Logo Image */}
            <div className="mb-4">
              <Image
                src="/logo/logo.png" // replace with your logo path
                alt="Filter Film Studio"
                width={160}
                height={50}
                className="object-contain"
              />
            </div>
            <p className="text-sm text-emerald-dark/70 leading-relaxed mb-6">
              Capturing timeless wedding stories with cinematic elegance, emotion, and authenticity
              across India.
            </p>

            <div className="flex gap-4">
              {[Instagram, Facebook, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 flex items-center justify-center border border-emerald-dark/20 text-emerald-dark/70 hover:text-gold hover:border-gold transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-lg font-semibold text-emerald-dark mb-6">
              Quick Links
            </h4>
            <ul className="space-y-3 text-xs font-semibold">
              {['HOME', 'ABOUT', 'PACKAGES', 'GALLERY', 'TEAM', 'CONTACT'].map((link) => (
                <li key={link}>
                  <Link
                    href={link === 'HOME' ? '/' : `/#${link.toLowerCase()}`}
                    className="text-emerald-dark/70 hover:text-gold transition-colors"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-heading text-lg font-semibold text-emerald-dark mb-6">Services</h4>
            <ul className="space-y-3 text-sm text-emerald-dark/70">
              <li>Wedding Photography</li>
              <li>Cinematic Wedding Films</li>
              <li>Pre-Wedding Shoots</li>
              <li>Drone Coverage</li>
              <li>Albums & Prints</li>
              <li>Same Day Edits</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading text-lg font-semibold text-emerald-dark mb-6">Contact</h4>
            <ul className="space-y-4 text-sm text-emerald-dark/70">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gold mt-1" />
                <span>
                  Gandhinagar 2nd Lane Extension
                  <br />
                  Berhampur, Odisha - 760001
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gold" />
                +91 9XXXXXXXXX
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gold" />
                info@filterfilm.in
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-6 border-t border-emerald-dark/10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-emerald-dark/50">
          <p>
            © {new Date().getFullYear()}{' '}
            <Link
              href="https://binarysquad.pages.dev/"
              className="text-primary font-semibold border-b-2 hover:text-primary hover:font-bold"
            >
              Binary Squad
            </Link>
            . Crafted with excellence.
          </p>
          {/* <div className="flex gap-6">
            <Link href="#" className="hover:text-gold transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-gold transition-colors">
              Terms of Service
            </Link>
          </div> */}
        </div>
      </div>
    </footer>
  );
}
