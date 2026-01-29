import { Loader2 } from 'lucide-react';
import { Suspense } from 'react';
import { GalleryContent } from './gallery-client';

// Main component with Suspense boundary
export default function FullGalleryPage() {
  return (
    <Suspense
      fallback={
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="py-24 flex flex-col items-center">
              <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading gallery…</p>
            </div>
          </div>
        </section>
      }
    >
      <GalleryContent />
    </Suspense>
  );
}
