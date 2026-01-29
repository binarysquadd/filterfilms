'use client';

import { useEffect, useRef, useState } from 'react';

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    // Force play the video when component mounts
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.error('Video autoplay failed:', error);
        setVideoError(true);
      });
    }
  }, []);

  return (
    <div className="overflow-hidden" id="home">
      {/* Hero Section */}
      <section className="relative min-h-screen w-full overflow-hidden">
        {/* Video Background */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => {
            console.error('Video failed to load');
            setVideoError(true);
          }}
        >
          <source src="/videos/wedding2.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Fallback Background Image - only shows if video fails */}
        {videoError && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: 'url(/hero-image/hero-image.jpg)' }}
          />
        )}
      </section>
    </div>
  );
}
