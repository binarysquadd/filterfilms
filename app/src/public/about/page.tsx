'use client';

import SectionHeader from '@/app/src/components/common/SectionHeader';
import { Button } from '@/app/src/components/ui/button';
import { PhoneCallIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/app/lib/firebase/auth-context';

function getRedirectByRole(role?: string) {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'team':
      return '/team/dashboard';
    case 'customer':
      return '/packages';
    default:
      return '/packages';
  }
}

export default function AboutSection() {
  const { user, loading } = useAuth();

  // Decide CTA destination
  const ctaHref = !loading
    ? user
      ? getRedirectByRole(user.role)
      : '/signin?redirect=/packages'
    : '/signin';

  return (
    <section id="about" className="relative overflow-hidden lg:py-20 py-12 bg-ivory">
      <div className="container mx-auto px-6 lg:px-8">
        <SectionHeader
          title="ABOUT US"
          subtitle="A cinematic storytelling studio capturing emotions, rituals, and moments that last forever."
          centered
        />

        <div className="mt-16 grid lg:grid-cols-12 gap-12 items-center">
          {/* Image Column */}
          <div className="lg:col-span-6 relative">
            <div className="relative overflow-hidden">
              <Image
                src="/about-image/about-image.jpg"
                alt="Filter Film Studio Wedding Moment"
                width={800}
                height={600}
                className="w-full h-[520px] object-cover scale-105 hover:scale-100 transition-transform duration-700"
                priority
              />
            </div>

            {/* Floating Badge */}
            <div className="absolute -bottom-6 -right-6 bg-background/90 backdrop-blur-xl border border-border px-6 py-4 shadow-xl">
              <p className="text-sm uppercase tracking-widest text-muted-foreground">Since</p>
              <p className="text-2xl font-bold text-primary">2018</p>
            </div>
          </div>

          {/* Content Column */}
          <div className="lg:col-span-6 space-y-6">
            <h3 className="text-3xl lg:text-4xl font-extrabold leading-tight">
              Crafting timeless wedding films & photographs
            </h3>

            <p className="text-lg text-muted-foreground leading-relaxed">
              At <span className="font-semibold text-foreground">Filter Film Studio</span>, we
              believe every Indian wedding is more than an event — it’s a cinematic journey filled
              with traditions, emotions, and stories waiting to be told.
            </p>

            <p className="text-lg text-muted-foreground leading-relaxed">
              From intimate rituals to grand celebrations, our team blends creativity with technical
              excellence to preserve your moments exactly the way they felt.
            </p>

            {/* CTA */}
            <div className="pt-6">
              <Link href={ctaHref}>
                <Button
                  size="lg"
                  className="group gap-3 rounded-full px-8 text-base font-semibold tracking-wide"
                >
                  <PhoneCallIcon className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                  {user ? 'View Packages' : 'Book Package'}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
