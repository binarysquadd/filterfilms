'use client';

import { useState, useEffect } from 'react';
import { X, Play, Filter, Loader2 } from 'lucide-react';
import SectionHeader from '@/app/src/components/common/SectionHeader';
import { Button } from '@/app/src/components/ui/button';
import { Gallery } from '@/app/types/gallery';
import Image from 'next/image';

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const galleriesRes = await fetch('/api/admin/gallery/public');
        const galleriesData = await galleriesRes.json();
        setGalleries(galleriesData.galleries || []);

        const categoriesRes = await fetch('/api/admin/gallery/categories');
        const categoriesData = await categoriesRes.json();
        setCategories(['All', ...(categoriesData.categories || [])]);
      } catch (err: any) {
        setError(err.message || 'Failed to load gallery');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredGallery =
    activeCategory === 'All'
      ? galleries
      : galleries.filter((item) => item.category === activeCategory);

  return (
    <>
      {/* Hero */}
      <section className="relative py-2" id="gallery">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="OUR PORTFOLIO"
            subtitle="A curated collection of moments we've had the honor to capture."
            centered
          />
        </div>
      </section>

      {/* Sticky Filter */}
      <section className="relative top-2 z-40 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex justify-center gap-2 py-3 overflow-x-auto scrollbar-hide">
            {categories.map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory(category)}
                className="whitespace-nowrap rounded-full"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Loading */}
      {loading && (
        <section className="py-24">
          <div className="flex flex-col items-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading gallery…</p>
          </div>
        </section>
      )}

      {/* Error */}
      {error && !loading && (
        <section className="py-24 text-center">
          <p className="text-destructive font-medium mb-3">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </section>
      )}

      {/* Gallery Grid */}
      {!loading && !error && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            {filteredGallery.length > 0 ? (
              <div
                className="
                  grid gap-4
                  grid-cols-1
                  sm:grid-cols-2
                  md:grid-cols-4
                "
              >
                {filteredGallery.map((item, index) => (
                  <div
                    key={item.id}
                    className="relative group overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all"
                    onClick={() => item.type === 'photo' && setSelectedImage(item.url)}
                  >
                    <div className="relative aspect-[4/5]">
                      <Image
                        src={
                          item.type === 'video'
                            ? (item.thumbnail ?? '/images/video-placeholder.jpg')
                            : (item.url ?? '/images/image-placeholder.jpg')
                        }
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Video Play */}
                      {item.type === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-14 h-14 rounded-full bg-gold/90 flex items-center justify-center shadow-lg">
                            <Play className="w-6 h-6 text-maroon-dark ml-1" />
                          </div>
                        </div>
                      )}

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 p-4">
                          <p className="text-white font-semibold text-sm">{item.title}</p>
                          <p className="text-gold text-xs">
                            {item.category} • {item.eventType}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <Filter className="w-14 h-14 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No items found</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gold"
            onClick={() => setSelectedImage(null)}
          >
            <X className="w-8 h-8" />
          </button>

          <div className="relative w-full max-w-6xl h-[90vh]">
            <Image src={selectedImage} alt="Preview" fill className="object-contain" />
          </div>
        </div>
      )}
    </>
  );
}
