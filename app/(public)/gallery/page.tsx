'use client';

import { useState, useEffect } from 'react';
import { X, Play, Filter, Loader2 } from 'lucide-react';
import SectionHeader from '@/app/src/components/common/SectionHeader';
import { Button } from '@/app/src/components/ui/button';
import { Gallery } from '@/app/types/gallery';
import Image from 'next/image';

/* ----------------------------------------
   HELPERS
----------------------------------------- */
const toEmbedUrl = (url: string) => {
  // YouTube
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const id = url.includes('youtu.be') ? url.split('/').pop() : new URL(url).searchParams.get('v');
    return `https://www.youtube.com/embed/${id}?autoplay=1`;
  }

  // Vimeo
  if (url.includes('vimeo.com')) {
    const id = url.split('/').pop();
    return `https://player.vimeo.com/video/${id}?autoplay=1`;
  }

  return url;
};

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedMedia, setSelectedMedia] = useState<Gallery | null>(null);

  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ----------------------------------------
     FETCH DATA
  ----------------------------------------- */
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
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load gallery';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ----------------------------------------
     FILTER
  ----------------------------------------- */
  const filteredGallery =
    activeCategory === 'All'
      ? galleries
      : galleries.filter((item) => item.category === activeCategory);

  /* ----------------------------------------
     UI
  ----------------------------------------- */
  return (
    <>
      {/* HERO */}
      <section className="py-4" id="gallery">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="OUR PORTFOLIO"
            subtitle="A curated collection of moments we've had the honor to capture."
            centered
          />
        </div>
      </section>

      {/* CATEGORY FILTER */}
      <section className="sticky top-0 z-40 bg-background">
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

      {/* LOADING */}
      {loading && (
        <section className="py-24">
          <div className="flex flex-col items-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading gallery…</p>
          </div>
        </section>
      )}

      {/* ERROR */}
      {error && !loading && (
        <section className="py-24 text-center">
          <p className="text-destructive font-medium mb-3">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </section>
      )}

      {/* GALLERY GRID */}
      {!loading && !error && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            {filteredGallery.length > 0 ? (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
                {filteredGallery.map((item) => (
                  <div
                    key={item.id}
                    className="relative group overflow-hidden cursor-pointer hover:shadow-xl transition-all"
                    onClick={() => setSelectedMedia(item)}
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

                      {/* VIDEO PLAY ICON */}
                      {item.type === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-14 h-14 rounded-full bg-gold/90 flex items-center justify-center">
                            <Play className="w-6 h-6 text-maroon-dark ml-1" />
                          </div>
                        </div>
                      )}

                      {/* OVERLAY */}
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

      {/* LIGHTBOX (PHOTO + VIDEO) */}
      {selectedMedia && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 overflow-y-hidden"
          onClick={() => setSelectedMedia(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gold z-10"
            onClick={() => setSelectedMedia(null)}
          >
            <X className="w-8 h-8" />
          </button>

          <div className="relative w-full max-w-6xl h-[90vh]" onClick={(e) => e.stopPropagation()}>
            {/* PHOTO */}
            {selectedMedia.type === 'photo' && (
              <Image
                src={selectedMedia.url}
                alt={selectedMedia.title}
                fill
                className="object-contain"
              />
            )}

            {/* VIDEO (UPLOAD) */}
            {selectedMedia.type === 'video' && selectedMedia.videoSource === 'upload' && (
              <video
                src={selectedMedia.url}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            )}

            {/* VIDEO (EXTERNAL OR FALLBACK) */}
            {selectedMedia.type === 'video' &&
              (selectedMedia.videoSource === 'external' || !selectedMedia.videoSource) && (
                <iframe
                  src={toEmbedUrl(selectedMedia.url)}
                  className="w-full h-full"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                />
              )}
          </div>
        </div>
      )}
    </>
  );
}
