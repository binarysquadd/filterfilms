'use client';

import SectionHeader from '@/app/src/components/common/SectionHeader';
import { Instagram, Quote } from 'lucide-react';
import Image from 'next/image';

export default function OurTeam() {
  const founder = {
    name: "Subham Dalai",
    role: "Founder & Cinematographer",
    specialization: "Cinematic Wedding Filmmaker",
    experience: "7+ Years Experience",
    bio: "With over 7 years of experience in the film industry, Subham founded Filter Film Studio with a vision to redefine wedding cinematography in India. His storytelling blends traditional Indian emotions with modern cinematic techniques, creating films that feel timeless, emotional, and deeply personal.",
    photo: "/team-image/founder1.png",
    instagram: "@subhamdalai__",
    studioInstagram: "@filterfilm.studio",
  };

  return (
    <section
      id="team"
      className="relative py-24 lg:py-32 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />

      <div className="relative container mx-auto px-4">
        <SectionHeader
          title="MEET THE FOUNDER"
          subtitle="The creative mind behind Filter Film Studio and its cinematic storytelling."
          centered
        />

        <div className="mt-20 grid lg:grid-cols-12 gap-12 items-center">
          {/* Image */}
          <div className="lg:col-span-5 relative">
            <div className="relative h-[520px] overflow-hidden shadow-2xl">
              <Image
                src={founder.photo}
                alt={founder.name}
                fill
                priority
                className="object-cover scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 bg-gold/10 text-gold px-5 py-2 rounded-full text-sm font-semibold mb-6">
              Founder • {founder.experience}
            </div>

            <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-3">
              {founder.name}
            </h2>

            <p className="text-gold text-xl font-semibold mb-2">
              {founder.role}
            </p>

            <p className="text-muted-foreground text-lg mb-8">
              {founder.specialization}
            </p>

            {/* Quote style bio */}
            <div className="relative bg-muted/40 backdrop-blur rounded-2xl p-8 mb-8">
              <Quote className="absolute -top-4 -left-4 w-10 h-10 text-gold/30" />
              <p className="text-lg leading-relaxed font-medium text-foreground">
                {founder.bio}
              </p>
            </div>

            {/* Social Links */}
            <div className="flex flex-wrap gap-4">
              <a
                href={`https://instagram.com/${founder.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-5 py-3 rounded-full border border-border hover:border-gold hover:text-gold transition-all"
              >
                <Instagram className="w-5 h-5" />
                <span className="font-medium">{founder.instagram}</span>
              </a>

              <a
                href={`https://instagram.com/${founder.studioInstagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-5 py-3 rounded-full border border-border hover:border-gold hover:text-gold transition-all"
              >
                <Instagram className="w-5 h-5" />
                <span className="font-medium">{founder.studioInstagram}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
