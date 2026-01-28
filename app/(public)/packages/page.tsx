'use client';

import Image from 'next/image';
import Link from 'next/link';
import SectionHeader from '@/app/src/components/common/SectionHeader';

const packages = [
  {
    title: 'Photography Packages',
    subtitle: 'PREMIUM COLLECTION',
    desc: 'Timeless wedding photography capturing emotions, traditions, and candid moments with artistic storytelling.',
    img: '/package-image/photo.png',
  },
  {
    title: 'Cinematography Packages',
    subtitle: 'BESPOKE FILMS',
    desc: 'Cinematic wedding films crafted like a movie, preserving your most memorable moments.',
    img: '/package-image/cinematography.png',
  },
  {
    title: 'Custom Packages',
    subtitle: 'TAILORED EXPERIENCE',
    desc: 'Create a package that perfectly fits your wedding vision and personal style.',
    img: '/package-image/custom1.png',
  },
];

export default function PackagesSection() {
  return (
    <section className="relative bg-ivory-dark py-24 overflow-hidden" id="packages">
      {/* Background Circles */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald/5 blur-3xl -translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald/5 blur-3xl translate-x-1/3 translate-y-1/3" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="mb-16">
          <SectionHeader
            title="PACKAGES"
            subtitle="Curated photography and cinematography experiences designed for your once-in-a-lifetime moments."
            centered
          />
        </div>

        {/* Packages Grid */}
        <div className="grid lg:grid-cols-12 gap-4 items-stretch">
          {/* Photography Feature */}
          <div className="lg:col-span-7 relative group overflow-hidden h-[600px]">
            <Image
              src={packages[0].img}
              alt={packages[0].title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8">
              <span className="inline-block px-4 py-1.5 bg-emerald/10 text-emerald text-xs font-semibold mb-2">
                {packages[0].subtitle}
              </span>
              <h3 className="text-4xl lg:text-5xl font-heading font-bold text-ivory mb-2">
                {packages[0].title}
              </h3>
              <p className="text-ivory/80 text-lg leading-relaxed max-w-xl">{packages[0].desc}</p>
            </div>
          </div>

          {/* Right Stack */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Cinematography Card */}
            <div className="relative group overflow-hidden h-[288px]">
              <Image
                src={packages[1].img}
                alt={packages[1].title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6">
                <span className="inline-block px-3 py-1 bg-emerald/10 text-emerald text-xs font-semibold mb-1">
                  {packages[1].subtitle}
                </span>
                <h3 className="text-2xl font-heading font-bold text-ivory mb-1">
                  {packages[1].title}
                </h3>
                <p className="text-ivory/80 text-sm leading-relaxed">{packages[1].desc}</p>
              </div>
            </div>

            {/* Custom Package Card */}
            <div className="relative group overflow-hidden h-[288px]">
              <Image
                src={packages[2].img}
                alt={packages[2].title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6">
                <span className="inline-block px-3 py-1 bg-emerald/10 text-emerald text-xs font-semibold mb-1">
                  {packages[2].subtitle}
                </span>
                <h3 className="text-2xl font-heading font-bold text-ivory mb-1">
                  {packages[2].title}
                </h3>
                <p className="text-ivory/80 text-sm leading-relaxed">{packages[2].desc}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/signin"
            className="inline-block bg-primary text-ivory font-semibold rounded-full px-8 py-4 text-lg hover:bg-emerald-dark transition-colors shadow"
          >
            Create Your Custom Package
          </Link>
        </div>
      </div>
    </section>
  );
}
