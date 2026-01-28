'use client';

import { Loader2, Check, Clock, ShoppingCart } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/app/src/components/ui/button';
import { Badge } from '@/app/src/components/ui/badge';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { CATEGORY, Category, Package, Packages } from '@/app/types/package';

interface PackageWithCategory extends Package {
  categoryLabel: string;
  categoryValue: Category;
}

interface CartItem {
  groupId: string;
  packageId: string[];
  name: string;
  category: string;
  price: number;
  startDate: string;
  endDate: string;
  description?: string;
  deliverables?: string[];
  duration?: string;
  preview?: string;
}

export default function CustomerPackagesPage() {
  const router = useRouter();

  const [packageGroups, setPackageGroups] = useState<Packages[]>([]);
  const [fetchingPackages, setFetchingPackages] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedPackage, setExpandedPackage] = useState<PackageWithCategory | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  const loadCartFromStorage = useCallback(() => {
    const saved = localStorage.getItem('bookingCart');
    if (!saved) return;

    try {
      setCart(JSON.parse(saved) as CartItem[]);
    } catch {
      localStorage.removeItem('bookingCart');
      setCart([]);
    }
  }, []);

  const fetchPackages = useCallback(async () => {
    setFetchingPackages(true);
    try {
      const res = await fetch('/api/admin/package');
      const data = await res.json();
      setPackageGroups(data.packages || []);
    } finally {
      setFetchingPackages(false);
    }
  }, []);

  useEffect(() => {
    fetchPackages();
    loadCartFromStorage();
  }, [fetchPackages, loadCartFromStorage]);

  const saveCartToStorage = (data: CartItem[]) => {
    localStorage.setItem('bookingCart', JSON.stringify(data));
  };

  const isInCart = (id: string) => cart.some((item) => item.packageId.includes(id));

  const addToCart = (pkg: PackageWithCategory) => {
    if (isInCart(pkg.id)) {
      toast.error('Package already in cart');
      return;
    }

    const group = packageGroups.find((g) => g.packages.some((p) => p.id === pkg.id));

    if (!group) return;

    const item: CartItem = {
      groupId: group.id,
      packageId: [pkg.id],
      name: pkg.name,
      category: pkg.categoryLabel,
      price: pkg.price,
      startDate: '',
      endDate: '',
      description: pkg.description,
      deliverables: pkg.deliverables,
      duration: pkg.duration,
      preview: pkg.preview,
    };

    const updated = [...cart, item];
    setCart(updated);
    saveCartToStorage(updated);
    toast.success(`${pkg.name} added to cart`);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);

  const allPackages: PackageWithCategory[] = packageGroups.flatMap((group) => {
    const label = CATEGORY.find((c) => c.value === group.category)?.label || group.category;

    return group.packages.map((pkg) => ({
      ...pkg,
      categoryLabel: label,
      categoryValue: group.category,
    }));
  });

  const categories = [
    { value: 'all', label: 'All Packages' },
    ...Array.from(new Set(allPackages.map((p) => p.categoryValue))).map((v) => ({
      value: v,
      label: CATEGORY.find((c) => c.value === v)?.label || v,
    })),
  ];

  const filteredPackages =
    selectedCategory === 'all'
      ? allPackages
      : allPackages.filter((p) => p.categoryValue === selectedCategory);

  /* ---------------- UI ---------------- */

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="font-heading text-4xl font-bold">Our Packages</h1>
          <p className="text-muted-foreground mt-1">Compare and explore our curated offerings</p>
        </div>

        <Button
          variant="link"
          onClick={() => router.push('/customer/bookings')}
          className="relative"
        >
          {cart.length > 0 && (
            <Badge className="ml-2 bg-red-500 absolute w-5 h-5 rounded-full flex items-center justify-center text-xs bottom-6 left-5">
              {cart.length}
            </Badge>
          )}
          <ShoppingCart className="w-16 h-16 mr-2" />
          Cart
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Button
            key={cat.value}
            size="sm"
            variant={selectedCategory === cat.value ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(cat.value)}
            className="rounded-full"
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Loading */}
      {fetchingPackages && (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      )}

      {/* TABLE HEADER (desktop) */}
      {!fetchingPackages && (
        <>
          <div className="hidden md:grid grid-cols-6 gap-4 px-4 py-2 text-md font-medium text-muted-foreground border-b">
            <div className="col-span-2">Package</div>
            <div>Category</div>
            <div>Duration</div>
            <div>Price</div>
            <div className="text-right">Action</div>
          </div>

          {/* TABLE BODY */}
          <div className="divide-y">
            {filteredPackages.map((pkg) => {
              const open = expandedPackage?.id === pkg.id;

              return (
                <div key={pkg.id} className="px-4">
                  {/* ROW */}
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4 py-4 items-center">
                    <div className="col-span-2 flex items-center gap-4">
                      <Image
                        src={pkg.preview}
                        alt={pkg.name}
                        width={80}
                        height={60}
                        className="object-cover rounded-full w-10 h-10"
                      />
                      <p className="font-medium">{pkg.name}</p>
                    </div>

                    <div className="hidden md:block text-sm">{pkg.categoryLabel}</div>

                    <div className="text-sm flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {pkg.duration} days
                    </div>

                    <div className="font-medium">{formatPrice(pkg.price)}</div>

                    <div className="text-right">
                      <button
                        onClick={() => setExpandedPackage(open ? null : pkg)}
                        className="text-sm text-primary hover:underline"
                      >
                        {open ? 'Hide' : 'View more'}
                      </button>
                    </div>
                  </div>

                  {/* EXPANDED */}
                  {open && (
                    <div className="grid md:grid-cols-2 gap-6 pb-6 animate-in fade-in">
                      <div className="relative aspect-[4/3] rounded-md overflow-hidden">
                        <Image src={pkg.preview} alt={pkg.name} fill className="object-cover" />
                      </div>

                      <div className="space-y-4">
                        <div className="flex flex-col gap-2">
                          <p className="text-sm text-muted-foreground line-clamp-10">
                            {pkg.description}
                          </p>
                          <div className="mt-2 space-y-2">
                            <p className="text-sm font-medium">Deliverables</p>
                            {pkg.deliverables.map((item, i) => (
                              <div key={i} className="flex gap-2 text-sm">
                                <Check className="w-4 h-4 text-primary mt-0.5" />
                                {item}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t">
                          <span className="text-lg font-semibold">{formatPrice(pkg.price)}</span>

                          <Button
                            size="sm"
                            onClick={() => addToCart(pkg)}
                            disabled={isInCart(pkg.id)}
                          >
                            {isInCart(pkg.id) ? 'In cart' : 'Add to cart'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
