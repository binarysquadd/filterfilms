'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Packages, Category, CATEGORY } from '@/app/types/package';
import { useAuth } from '../lib/firebase/auth-context';
import toast from 'react-hot-toast';
import { Loader2, ChevronDown } from 'lucide-react';
import SectionHeader from '@/app/src/components/common/SectionHeader';

type PackageWithCategoryAndSub = {
  id: string;
  name: string;
  price: number;
  description: string;
  deliverables: string[];
  duration: string;
  preview: string;
  popular?: boolean;
  category: string;
  subcategory: string;
};

const extractSubCategory = (name: string): string => {
  const lower = name.toLowerCase();

  if (lower.includes('haldi')) return 'haldi';
  if (lower.includes('mehndi')) return 'mehndi';
  if (lower.includes('ceremony')) return 'ceremony';
  if (lower.includes('reception')) return 'reception';
  if (lower.includes('film')) return 'films';
  if (lower.includes('pre wedding') || lower.includes('pre-wedding')) return 'pre-wedding';

  return 'others';
};

/* --------------------------------
   WEDDING SUBCATEGORIES
--------------------------------- */
const WEDDING_SUBCATEGORIES = [
  { label: 'All', value: 'all' },
  { label: 'Ceremony', value: 'ceremony' },
  { label: 'Haldi', value: 'haldi' },
  { label: 'Mehndi', value: 'mehndi' },
  { label: 'Reception', value: 'reception' },
  { label: 'Wedding Films', value: 'films' },
];

export default function PackagesPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [packageGroups, setPackageGroups] = useState<Packages[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');
  const [activeWeddingSub, setActiveWeddingSub] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const isLoggedIn = !!user;

  /* --------------------------------
       FETCH
    --------------------------------- */
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

  /* Reset wedding sub-filter when category changes */
  useEffect(() => {
    setActiveWeddingSub('all');
  }, [activeCategory]);

  /* --------------------------------
       FILTER LOGIC
    --------------------------------- */
  const filteredPackages = useMemo<PackageWithCategoryAndSub[]>(() => {
    let list: PackageWithCategoryAndSub[] =
      activeCategory === 'all'
        ? packageGroups.flatMap((group) =>
            group.packages.map((pkg) => ({
              ...pkg,
              category: group.category,
              subcategory: extractSubCategory(pkg.name), // 👈 derived safely
            }))
          )
        : packageGroups
            .find((g) => g.category === activeCategory)
            ?.packages.map((pkg) => ({
              ...pkg,
              category: activeCategory,
              subcategory: extractSubCategory(pkg.name),
            })) || [];

    // ✅ GENERIC SUB FILTER (NO `any`)
    if (activeWeddingSub !== 'all') {
      list = list.filter((pkg) => pkg.subcategory === activeWeddingSub);
    }

    return list;
  }, [packageGroups, activeCategory, activeWeddingSub]);

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <SectionHeader
          title="Our Packages"
          subtitle="Choose a package that fits your story perfectly"
          centered
        />

        {/* PRIMARY + WEDDING SUB FILTERS */}
        <div className="flex justify-center mt-8 mb-12">
          <div className="flex items-center gap-4 flex-wrap">
            {/* PRIMARY CATEGORY */}
            <div className="relative">
              <select
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value as Category | 'all')}
                className="appearance-none rounded-full border px-4 py-2 pr-10 text-sm outline-none cursor-pointer bg-white"
              >
                <option value="all">All Categories</option>
                {CATEGORY.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>

            {/* WEDDING SUB CATEGORY */}
            {activeCategory === 'wedding' && (
              <div className="relative">
                <select
                  value={activeWeddingSub}
                  onChange={(e) => setActiveWeddingSub(e.target.value)}
                  className="appearance-none rounded-full border px-4 py-2 pr-10 text-sm outline-none cursor-pointer bg-white"
                >
                  {WEDDING_SUBCATEGORIES.map((sub) => (
                    <option key={sub.value} value={sub.value}>
                      {sub.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-muted-foreground" />
              </div>
            )}
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="py-24 flex flex-col items-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading Packages…</p>
          </div>
        )}

        {/* EMPTY */}
        {!loading && filteredPackages.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">No packages found</div>
        )}

        {/* GRID */}
        {!loading && filteredPackages.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-0.5">
            {filteredPackages.map((pkg: PackageWithCategoryAndSub) => (
              <div key={pkg.id} className="group relative bg-white overflow-hidden">
                {/* IMAGE */}
                <div className="relative aspect-[4/5]">
                  <Image
                    src={pkg.preview}
                    alt={pkg.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {pkg.popular && (
                    <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 text-xs font-medium rounded-full">
                      Popular
                    </div>
                  )}
                </div>

                {/* SLIDE-UP CONTENT */}
                <div className="absolute inset-x-0 bottom-0 translate-y-[70%] group-hover:translate-y-0 transition-transform duration-500 bg-white border-t">
                  <div className="p-5">
                    <h3 className="text-lg font-semibold mb-3">{pkg.name}</h3>

                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {pkg.description}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                      <span>{pkg.duration} Days</span>
                      <span>•</span>
                      <span>{pkg.deliverables.length} Deliverables</span>
                    </div>

                    {isLoggedIn ? (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Starting from</p>
                          <p className="text-lg font-bold text-primary">
                            ₹{pkg.price.toLocaleString('en-IN')}
                          </p>
                        </div>

                        <button
                          onClick={() => router.push(`/customer/inquiries/new?packageId=${pkg.id}`)}
                          className="px-5 py-2 bg-primary text-white text-sm font-medium rounded-full hover:bg-primary/90 transition"
                        >
                          Inquire
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => router.push('/signin?redirect=/packages')}
                        className="w-full py-3 bg-muted text-sm font-medium rounded-full hover:bg-muted/80 transition"
                      >
                        Login to view price
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
