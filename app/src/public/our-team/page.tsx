'use client';

import SectionHeader from '@/app/src/components/common/SectionHeader';
import { Quote } from 'lucide-react';
import Image from 'next/image';

export default function OurTeam() {
  const founder = {
    name: 'Subham Dalai',
    role: 'Founder & Cinematographer',
    specialization: 'Cinematic Wedding Filmmaker',
    experience: '7+ Years Experience',
    bio: `With over seven years of experience in the film industry, Subham Dalai founded Filter Film Studio with a vision to elevate wedding cinematography beyond documentation. His work blends deep-rooted Indian emotions with refined cinematic storytelling, crafting films that feel intimate, timeless, and visually powerful.`,
    photo: '/founder/founder_filterfilm.webp',
    instagram: '@subhamdalai__',
    studioInstagram: '@filterfilm.studio',

    credentials: [
      {
        label: 'Education',
        value:
          'Bachelor’s Degree in Film & Media Production with advanced training in cinematic storytelling and visual composition.',
      },
      {
        label: 'Teaching & Mentorship',
        value:
          'Actively mentors aspiring fashion designers and wedding cinematographers through workshops, one-on-one sessions, and on-field training.',
      },
      {
        label: 'Certifications',
        value:
          'Certified Professional Cinematographer with specialized certifications in wedding filmmaking, color grading, and film editing.',
      },
    ],
  };

  return (
    <section id="team" className="relative py-28 lg:py-36">
      <div className="container mx-auto px-4">
        <SectionHeader
          title="THE FOUNDER"
          subtitle="A cinematic storyteller shaping timeless wedding films."
          centered
        />

        <div className="mt-24 grid lg:grid-cols-12 gap-16 items-start">
          {/* Image */}
          <div className="lg:col-span-4">
            <div className="relative h-[560px] overflow-hidden">
              <Image
                src={founder.photo}
                alt={founder.name}
                fill
                priority
                className="object-cover w-full h-full"
              />
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-8">
            <span className="text-gold uppercase tracking-widest text-sm font-medium">
              {founder.experience}
            </span>

            <h2 className="mt-4 text-5xl font-extrabold tracking-tight">{founder.name}</h2>

            <p className="mt-2 text-gold text-xl font-medium">{founder.role}</p>

            <p className="mt-6 text-lg text-muted-foreground max-w-2xl">{founder.specialization}</p>

            {/* Bio */}
            <div className="relative mt-12 pl-8">
              <Quote className="absolute -left-4 top-0 w-6 h-6 text-gold/40" />
              <p className="text-xl leading-relaxed font-light max-w-3xl">{founder.bio}</p>
            </div>

            {/* Credentials */}
            <div className="mt-16 space-y-3 max-w-3xl">
              {founder.credentials.map((item, index) => (
                <div key={index} className="flex gap-8 items-start border-t border-border pt-8">
                  <span className="min-w-[160px] text-sm uppercase tracking-wider text-gold">
                    {item.label}
                  </span>
                  <p className="text-lg text-muted-foreground leading-relaxed">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Social */}
            <div className="mt-16 flex gap-6">
              <a
                href={`https://instagram.com/${founder.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm uppercase tracking-widest hover:text-gold transition-colors"
              >
                {founder.instagram}
              </a>

              <a
                href={`https://instagram.com/${founder.studioInstagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm uppercase tracking-widest hover:text-gold transition-colors"
              >
                {founder.studioInstagram}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
