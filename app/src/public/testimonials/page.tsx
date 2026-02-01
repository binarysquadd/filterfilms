'use client';

import { useRef } from 'react';
import SectionHeader from '@/app/src/components/common/SectionHeader';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  {
    name: 'Gayatri Patra',
    role: 'Wedding Client',
    rating: 5,
    review:
      'Thank you for making the whole experience so smooth and enjoyable. Your creativity and timing were spot-on in every shot.',
  },
  {
    name: 'Subhashree Rath',
    role: 'Client',
    rating: 5,
    review:
      'Filter Films rocks! Loved their creative team, attention to detail, and stunning studio setup.',
  },
  {
    name: 'Hrusikesh Gouda',
    role: 'Wedding Client',
    rating: 5,
    review:
      'Professional, friendly, and incredibly talented. They captured every emotion perfectly.',
  },
  {
    name: 'Nikita Mishra',
    role: 'Wedding Client',
    rating: 5,
    review: 'From engagement to reception, working with Filter Films was an absolute pleasure.',
  },
  {
    name: 'Biswajit Jena',
    role: 'Client',
    rating: 5,
    review: 'Best photography team from South Odisha. Highly recommended.',
  },
];

export default function TestimonialsSection() {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;

    const width = scrollRef.current.clientWidth;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -width : width,
      behavior: 'smooth',
    });
  };

  return (
    <section className="py-24 bg-muted">
      <div className="container mx-auto px-4">
        <SectionHeader
          title="Testimonials"
          subtitle="Stories shared by the people we've captured memories for"
          centered
        />

        <div className="relative mt-16">
          {/* LEFT BUTTON */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full border bg-primary text-muted p-3 shadow hover:scale-105 transition"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* SCROLL AREA */}
          <div
            ref={scrollRef}
            className="flex gap-12 overflow-x-hidden scroll-smooth snap-x snap-mandatory scrollbar-hide px-12"
          >
            {testimonials.map((t, i) => (
              <div key={i} className="snap-center shrink-0 w-[90%] md:w-[70%] lg:w-[55%]">
                <div className="py-10">
                  {/* Review */}
                  <p className="text-2xl md:text-3xl lg:text-4xl font-light leading-relaxed">
                    “{t.review}”
                  </p>

                  {/* Meta */}
                  <div className="mt-8 flex items-center gap-4">
                    <div className="flex gap-1">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                      ))}
                    </div>

                    <span className="text-muted-foreground">—</span>

                    <div>
                      <p className="font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT BUTTON */}
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full border bg-primary text-muted p-3 shadow hover:scale-105 transition"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
