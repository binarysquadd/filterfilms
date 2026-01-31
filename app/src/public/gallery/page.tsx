'use client';

import { useState, useEffect } from 'react';
import { X, Play, Filter, Loader2 } from 'lucide-react';
import SectionHeader from '@/app/src/components/common/SectionHeader';
import { Button } from '@/app/src/components/ui/button';
import { EventType, Gallery } from '@/app/types/gallery';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

/* ----------------------------------------
   HELPERS
----------------------------------------- */
const toEmbedUrl = (url: string) => {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const id = url.includes('youtu.be') ? url.split('/').pop() : new URL(url).searchParams.get('v');
    return `https://www.youtube.com/embed/${id}?autoplay=1`;
  }

  if (url.includes('vimeo.com')) {
    const id = url.split('/').pop();
    return `https://player.vimeo.com/video/${id}?autoplay=1`;
  }

  return url;
};

const PREVIEW_LIMIT = 8;

export default function GallerySection() {
  const router = useRouter();

  const [activeEventType, setActiveEventType] = useState<EventType>('Wedding');
  const [selectedMedia, setSelectedMedia] = useState<Gallery | null>(null);

  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [events, setEvents] = useState<string[]>(['All']);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ----------------------------------------
     FETCH DATA
  ----------------------------------------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const galleriesRes = await fetch('/api/admin/gallery/public');
        const galleriesData = await galleriesRes.json();
        setGalleries(galleriesData.galleries || []);

        const eventsRes = await fetch('/api/admin/gallery/events');
        const eventsData = await eventsRes.json();
        setEvents(['All', ...(eventsData.events || [])]);
      } catch {
        setError('Failed to load gallery');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ----------------------------------------
     FILTER + PREVIEW
  ----------------------------------------- */
  const filteredGallery =
    activeEventType === 'All'
      ? galleries
      : galleries.filter((item) => item.eventType === activeEventType);

  const previewGallery = filteredGallery.slice(0, PREVIEW_LIMIT);

  /* ----------------------------------------
     UI
  ----------------------------------------- */
  return (
    <>
      {/* HEADER */}
      <section className="py-6" id="gallery">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="OUR PORTFOLIO"
            subtitle="A curated collection of moments we've had the honor to capture."
            centered
          />
        </div>
      </section>

      {/* FILTER */}
      <section className="sticky top-0 z-40 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex justify-center gap-2 py-3 overflow-x-auto scrollbar-hide">
            {events.map((event) => (
              <Button
                key={event}
                size="sm"
                variant={activeEventType === event ? 'default' : 'outline'}
                onClick={() => setActiveEventType(event)}
                className="rounded-full whitespace-nowrap"
              >
                {event}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* LOADING */}
      {loading && (
        <div className="py-24 flex flex-col items-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading gallery…</p>
        </div>
      )}

      {/* ERROR */}
      {error && !loading && (
        <div className="py-24 text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      )}

      {/* GRID */}
      {!loading && !error && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            {previewGallery.length > 0 ? (
              <>
                <div className="grid gap-0.5 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
                  {previewGallery.slice(0, 8).map((item) => (
                    <div
                      key={item.id}
                      className="group relative overflow-hidden cursor-pointer hover:shadow-xl transition"
                      onClick={() => setSelectedMedia(item)}
                    >
                      <div className="relative aspect-[4/5]">
                        <Image
                          src={
                            item.type === 'video'
                              ? (item.thumbnail ?? '/images/video-placeholder.jpg')
                              : item.url
                          }
                          alt={item.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                        {item.type === 'video' && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-14 h-14 rounded-full bg-gold/90 flex items-center justify-center">
                              <Play className="w-6 h-6 text-maroon-dark ml-1" />
                            </div>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition">
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

                {/* VIEW MORE */}
                {/* {filteredGallery.length > PREVIEW_LIMIT && ( */}
                <div className="mt-12 text-center">
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => router.push(`/gallery`)}
                    className="rounded-full"
                  >
                    View Full Gallery
                  </Button>
                </div>
                {/* )} */}
              </>
            ) : (
              <div className="text-center py-20">
                <Filter className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No items found</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* LIGHTBOX */}
      {selectedMedia && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gold"
            onClick={() => setSelectedMedia(null)}
          >
            <X className="w-8 h-8" />
          </button>

          <div className="relative w-full max-w-6xl h-[90vh]" onClick={(e) => e.stopPropagation()}>
            {selectedMedia.type === 'photo' && (
              <Image
                src={selectedMedia.url}
                alt={selectedMedia.title}
                fill
                className="object-contain"
              />
            )}

            {selectedMedia.type === 'video' && selectedMedia.videoSource === 'upload' && (
              <video
                src={selectedMedia.url}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            )}

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
