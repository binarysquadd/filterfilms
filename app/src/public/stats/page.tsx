'use client';

import { useEffect, useRef, useState } from 'react';
import { Users, MapPin, Camera } from 'lucide-react';
import SectionHeader from '@/app/src/components/common/SectionHeader';

/* ----------------------------------------
   STATS CONFIG
----------------------------------------- */
const stats = [
  {
    label: 'States Covered',
    value: 15,
    suffix: '+',
    icon: MapPin,
  },
  {
    label: 'Projects Covered',
    value: 500,
    suffix: '+',
    icon: Camera,
  },
  {
    label: 'Happy Clients',
    value: 1200,
    suffix: '+',
    icon: Users,
  },
];

/* ----------------------------------------
   COUNTER COMPONENT
----------------------------------------- */
function Counter({ end, duration = 1500 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = timestamp - startTimeRef.current;

      const percentage = Math.min(progress / duration, 1);
      setCount(Math.floor(percentage * end));

      if (percentage < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <span>{count}</span>;
}

/* ----------------------------------------
   SECTION
----------------------------------------- */
export default function StatisticsSection() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [startCounting, setStartCounting] = useState(false);

  /* Trigger counter when section is visible */
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStartCounting(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-10">
      <div className="container mx-auto px-4">
        <SectionHeader
          title="OUR ACHIEVEMENTS"
          subtitle="Celebrating milestones and moments that define our journey."
          centered
        />

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="flex flex-col items-center text-center p-8 transition"
              >
                {/* Icon */}
                <div className="mb-4 flex items-center justify-center w-14 h-14 rounded-full bg-primary/10">
                  <Icon className="w-7 h-7 text-primary" />
                </div>

                {/* Counter */}
                <p className="text-4xl font-bold">
                  {startCounting ? (
                    <>
                      <Counter end={stat.value} />
                      {stat.suffix}
                    </>
                  ) : (
                    `0${stat.suffix}`
                  )}
                </p>

                {/* Label */}
                <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
