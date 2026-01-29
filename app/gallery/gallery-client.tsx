'use client';

import { useEffect, useState } from 'react';
import { Play, Loader2, Filter, Share2, Check } from 'lucide-react';
import Image from 'next/image';
import { Gallery } from '@/app/types/gallery';
import { Button } from '@/app/src/components/ui/button';
import SectionHeader from '../src/components/common/SectionHeader';
import { useRouter, useSearchParams } from 'next/navigation';

// Separate component that uses useSearchParams
export function GalleryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  /* ----------------------------------------
       STATE
    ----------------------------------------- */
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [events, setEvents] = useState<string[]>(['All']);
  const [activeEvent, setActiveEvent] = useState('All');
  const [copied, setCopied] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ----------------------------------------
       READ EVENT FROM URL (ON LOAD)
    ----------------------------------------- */
  useEffect(() => {
    const eventFromUrl = searchParams.get('event');
    if (eventFromUrl) {
      setActiveEvent(decodeURIComponent(eventFromUrl));
    } else {
      setActiveEvent('All');
    }
  }, [searchParams]);

  /* ----------------------------------------
       FETCH DATA
    ----------------------------------------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/gallery/public');
        const data = await res.json();
        setGalleries(data.galleries || []);

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
       FILTER
    ----------------------------------------- */
  const filteredGallery =
    activeEvent === 'All' ? galleries : galleries.filter((g) => g.eventType === activeEvent);

  /* ----------------------------------------
       UPDATE URL ON FILTER CHANGE
    ----------------------------------------- */
  const handleEventChange = (event: string) => {
    setActiveEvent(event);

    if (event === 'All') {
      router.push('/gallery', { scroll: false });
    } else {
      router.push(`/gallery?event=${encodeURIComponent(event)}`, {
        scroll: false,
      });
    }
  };

  /* ----------------------------------------
       SHARE LINK HANDLER
    ----------------------------------------- */
  const handleShareLink = async () => {
    const url = window.location.href;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  /* ----------------------------------------
       UI
    ----------------------------------------- */
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <SectionHeader
          title="Gallery"
          subtitle="Explore our curated collection of moments captured through our lens."
          centered
        />

        {/* FILTER & SHARE */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-10">
          {/* Filter Buttons */}
          <div className="flex justify-center gap-2 overflow-x-auto scrollbar-hide">
            {events.map((event) => (
              <Button
                key={event}
                size="sm"
                variant={activeEvent === event ? 'default' : 'outline'}
                onClick={() => handleEventChange(event)}
                className="rounded-full whitespace-nowrap"
              >
                {event}
              </Button>
            ))}
          </div>

          {/* Share Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleShareLink}
            className="rounded-full whitespace-nowrap gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                Share
              </>
            )}
          </Button>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="py-24 flex flex-col items-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading gallery…</p>
          </div>
        )}

        {/* ERROR */}
        {error && !loading && (
          <div className="text-center py-24">
            <Filter className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {/* GRID */}
        {!loading && !error && (
          <>
            {filteredGallery.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {filteredGallery.map((item) => (
                  <div
                    key={item.id}
                    className="group relative overflow-hidden hover:shadow-xl transition cursor-pointer"
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
                          <p className="text-gold text-xs">{item.category}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-24">
                <Filter className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No items found for {activeEvent}</p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
