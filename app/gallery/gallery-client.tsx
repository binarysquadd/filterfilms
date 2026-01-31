'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Play, Loader2, Share2, Check, X, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';

import { Gallery, eventTypes } from '@/app/types/gallery';
import { Button } from '@/app/src/components/ui/button';
import SectionHeader from '../src/components/common/SectionHeader';

/* ---------------- HELPER ---------------- */
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

export function GalleryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const wheelLock = useRef(false);

  /* ---------------- STATE ---------------- */
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [events, setEvents] = useState<string[]>(['All']);

  const [activeEvent, setActiveEvent] = useState('All');
  const [activeCategory, setActiveCategory] = useState('All');

  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ---------------- URL → STATE ---------------- */
  useEffect(() => {
    setActiveEvent(searchParams.get('event') ?? 'All');
    setActiveCategory(searchParams.get('category') ?? 'All');
    setActiveItemId(searchParams.get('item'));
  }, [searchParams]);

  /* ---------------- FETCH ---------------- */
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

  /* ---------------- FILTERED LIST ---------------- */
  const filteredGallery = useMemo(() => {
    return galleries.filter((item) => {
      const eventMatch = activeEvent === 'All' || item.eventType === activeEvent;
      const categoryMatch = activeCategory === 'All' || item.category === activeCategory;
      return eventMatch && categoryMatch;
    });
  }, [galleries, activeEvent, activeCategory]);

  /* ---------------- ACTIVE INDEX ---------------- */
  const activeIndex = useMemo(() => {
    if (!activeItemId) return null;
    const index = filteredGallery.findIndex((g) => g.id === activeItemId);
    return index === -1 ? null : index;
  }, [activeItemId, filteredGallery]);

  /* ---------------- URL HELPER ---------------- */
  const updateURL = useCallback(
    (paramsObj: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(paramsObj).forEach(([k, v]) => (v ? params.set(k, v) : params.delete(k)));

      router.replace(`/gallery?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  /* ---------------- LIGHTBOX ---------------- */
  const openLightbox = useCallback(
    (id: string) => {
      setActiveItemId(id);
      updateURL({ item: id });
    },
    [updateURL]
  );

  const closeLightbox = useCallback(() => {
    setActiveItemId(null);
    updateURL({ item: null });
  }, [updateURL]);

  /* ---------------- SCROLL / KEY NAV ---------------- */
  useEffect(() => {
    if (activeIndex === null) return;

    const next = () => {
      if (activeIndex < filteredGallery.length - 1) {
        const nextId = filteredGallery[activeIndex + 1].id;
        setActiveItemId(nextId);
        updateURL({ item: nextId });
      }
    };

    const prev = () => {
      if (activeIndex > 0) {
        const prevId = filteredGallery[activeIndex - 1].id;
        setActiveItemId(prevId);
        updateURL({ item: prevId });
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (wheelLock.current) return;
      wheelLock.current = true;

      if (e.deltaY > 0) {
        next();
      } else {
        prev();
      }

      setTimeout(() => (wheelLock.current = false), 400);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') prev();
      if (e.key === 'Escape') closeLightbox();
    };

    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
    };
  }, [activeIndex, filteredGallery, closeLightbox, updateURL]);

  /* ---------------- SHARE ---------------- */
  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleItemShare = async (itemId: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set('item', itemId);

    const fullUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;

    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link', err);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <SectionHeader
          title="Gallery"
          subtitle="Explore moments effortlessly and relive them with ease"
          centered
        />

        {/* FILTERS BAR */}
        <div className="flex justify-center mt-6 items-center gap-3 mb-10 flex-wrap">
          {/* Event Filter */}
          <div className="relative">
            <select
              value={activeEvent}
              onChange={(e) => {
                setActiveEvent(e.target.value);
                setActiveCategory('All');
                updateURL({
                  event: e.target.value === 'All' ? null : e.target.value,
                  category: null,
                });
              }}
              className="appearance-none rounded-full border px-4 py-2 pr-10 text-sm outline-none cursor-pointer"
            >
              {events.map((e) => (
                <option key={e} value={e}>
                  {e === 'All' ? 'All Events' : e}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-muted-foreground" />
          </div>

          {/* Category Filter */}
          {activeEvent !== 'All' && (
            <div className="relative">
              <select
                value={activeCategory}
                onChange={(e) => {
                  setActiveCategory(e.target.value);
                  updateURL({
                    category: e.target.value === 'All' ? null : e.target.value,
                  });
                }}
                className="appearance-none rounded-full border px-4 py-2 pr-10 text-sm outline-none cursor-pointer"
              >
                <option value="All">All Categories</option>
                {eventTypes[activeEvent].categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-muted-foreground" />
            </div>
          )}
        </div>

        {/* GRID */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && <div className="text-center py-20 text-muted-foreground">{error}</div>}

        {!loading && !error && filteredGallery.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">No moments found</div>
        )}

        {!loading && !error && filteredGallery.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0.5">
            {filteredGallery.map((item) => (
              <div
                key={item.id}
                onClick={() => openLightbox(item.id)}
                className="relative aspect-[4/5] cursor-pointer overflow-hidden group"
              >
                {/* Thumbnail */}
                <Image
                  src={item.type === 'video' ? (item.thumbnail ?? item.url) : item.url}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Video Play Icon */}
                {item.type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-12 h-12 rounded-full bg-gold flex items-center justify-center transition-transform group-hover:scale-110">
                      <Play className="w-5 h-5 text-white ml-1" />
                    </div>
                  </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* Bottom Bar */}
                  <div className="absolute bottom-0 w-full flex items-center justify-between px-4 py-3">
                    {/* Info */}
                    <div className="pr-10">
                      <p className="text-white font-semibold text-sm leading-tight">{item.title}</p>
                      <p className="text-gold text-xs">
                        {item.category} • {item.eventType}
                      </p>
                    </div>

                    {/* Share Button */}
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleItemShare(item.id);
                      }}
                      variant="ghost"
                      size="icon"
                      className="text-white hover:text-gold hover:bg-white/10 transition"
                      aria-label="Share image"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* LIGHTBOX */}
        {activeIndex !== null && (
          <div
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 text-white hover:text-white/70 transition z-10"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Share Button */}
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleShare();
              }}
              variant="close"
              size="icon"
              className="absolute top-3 left-9 -translate-x-1/2 text-white border z-10 hover:border-gold hover:text-gold hover:bg-transparent transition"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-1" />
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 mr-1" />
                </>
              )}
            </Button>

            {/* Progress Indicator */}
            <div className="absolute top-14 left-6 text-white/60 text-sm z-10 pointer-events-none">
              {activeIndex + 1} / {filteredGallery.length}
            </div>

            <div
              className="relative w-screen h-screen flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* PHOTO */}
              {filteredGallery[activeIndex].type === 'photo' && (
                <Image
                  src={filteredGallery[activeIndex].url}
                  alt={filteredGallery[activeIndex].title}
                  fill
                  priority
                  sizes="100vw"
                  className="object-contain"
                />
              )}

              {/* UPLOADED VIDEO */}
              {filteredGallery[activeIndex].type === 'video' &&
                filteredGallery[activeIndex].videoSource === 'upload' && (
                  <video
                    src={filteredGallery[activeIndex].url}
                    controls
                    autoPlay
                    className="max-h-screen max-w-screen"
                  />
                )}

              {/* EXTERNAL VIDEO (YouTube/Vimeo) */}
              {filteredGallery[activeIndex].type === 'video' &&
                (filteredGallery[activeIndex].videoSource === 'external' ||
                  !filteredGallery[activeIndex].videoSource) && (
                  <iframe
                    src={toEmbedUrl(filteredGallery[activeIndex].url)}
                    className="w-full h-full max-h-screen max-w-screen"
                    allow="autoplay; fullscreen"
                    allowFullScreen
                  />
                )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
