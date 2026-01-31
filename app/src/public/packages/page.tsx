'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Packages, CATEGORY } from '@/app/types/package';
import SectionHeader from '@/app/src/components/common/SectionHeader';
import { Button } from '@/app/src/components/ui/button';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

type DisplayPackage = {
  id: string;
  name: string;
  description: string;
  preview: string;
  duration: string;
  // deliverables: string[];
  category: string;
};

export default function FeaturedPackagesSection() {
  const [packageGroups, setPackageGroups] = useState<Packages[]>([]);
  const [activeCategory, setActiveCategory] = useState<'all' | string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await fetch('/api/admin/package/public');
        const data = await res.json();
        setPackageGroups(data.packageGroups || []);
      } catch {
        toast.error('Failed to load packages');
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  const popularPackages: DisplayPackage[] = useMemo(() => {
    const all = packageGroups.flatMap((group) =>
      group.packages
        .filter((p) => p.popular)
        .map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          preview: p.preview,
          duration: p.duration,
          // deliverables: p.deliverables ?? [],
          category: group.category,
        }))
    );

    return activeCategory === 'all'
      ? all.slice(0, 6)
      : all.filter((p) => p.category === activeCategory).slice(0, 6);
  }, [packageGroups, activeCategory]);

  const availableCategories = useMemo(
    () => packageGroups.filter((g) => g.packages.some((p) => p.popular)).map((g) => g.category),
    [packageGroups]
  );

  return (
    <section className="py-24 bg-ivory-dark" id="packages">
      <div className="container mx-auto px-4">
        <SectionHeader
          title="Packages"
          subtitle="Clear, structured packages designed for real-world needs"
          centered
        />

        {/* FILTER */}
        <div className="flex justify-center gap-2 mt-8 mb-14 overflow-x-auto scrollbar-hide">
          <Button
            size="sm"
            variant={activeCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setActiveCategory('all')}
            className="rounded-full whitespace-nowrap"
          >
            All
          </Button>
          {availableCategories.map((cat) => (
            <Button
              key={cat}
              size="sm"
              variant={activeCategory === cat ? 'default' : 'outline'}
              onClick={() => setActiveCategory(cat)}
              className="rounded-full whitespace-nowrap"
            >
              {CATEGORY.find((c) => c.value === cat)?.label}
            </Button>
          ))}
        </div>

        {/* GRID */}
        <div className="relative min-h-[360px]">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
            </div>
          ) : popularPackages.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularPackages.slice(0, 6).map((pkg) => (
                <div key={pkg.id} className="border border-border bg-white flex flex-col">
                  {/* Image */}
                  <div className="relative h-52">
                    <Image src={pkg.preview} alt={pkg.name} fill className="object-cover" />
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold">{pkg.name}</h3>
                      <span className="text-xs uppercase tracking-wide text-muted-foreground">
                        {CATEGORY.find((c) => c.value === pkg.category)?.label}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {pkg.description}
                    </p>

                    {/* Deliverables */}
                    {/* <ul className="space-y-2 text-sm mb-6">
                      {pkg.deliverables.slice(0, 5).map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-4 h-4 mt-0.5 text-primary" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul> */}

                    {/* Footer */}
                    <div className="mt-auto flex items-center justify-between pt-4 border-t">
                      <span className="text-sm text-muted-foreground">
                        Duration: {pkg.duration} Days
                      </span>

                      <Link href="/packages" className="text-primary font-medium text-sm">
                        View Details →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center text-muted-foreground py-20">
              No featured packages available
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Link
            href="/packages"
            className="inline-block bg-primary text-white px-10 py-4 font-semibold hover:bg-primary/90 transition rounded-full"
          >
            View All Packages
          </Link>
        </div>
      </div>
    </section>
  );
}
