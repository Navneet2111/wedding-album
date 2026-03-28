"use client";

import { useEffect, useRef, useState } from "react";

type LazyDriveGalleryProps = {
  folderId: string;
};

export default function LazyDriveGallery({ folderId }: LazyDriveGalleryProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const node = containerRef.current;

    if (!node || shouldLoad) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "300px 0px",
        threshold: 0.1,
      },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [shouldLoad]);

  return (
    <div
      ref={containerRef}
      className="rounded-xl border border-rose-900/10 bg-white/70 p-4 shadow-[0_18px_45px_rgba(102,35,49,0.08)] md:p-6"
    >
      <div className="overflow-hidden rounded-xl border border-rose-900/10 bg-[linear-gradient(145deg,rgba(255,251,247,0.96),rgba(250,232,220,0.92))]">
        {shouldLoad ? (
          <iframe
            title="Drive gallery"
            src={`https://drive.google.com/embeddedfolderview?id=${folderId}#grid`}
            className="h-[70vh] min-h-[520px] w-full"
            loading="lazy"
          />
        ) : (
          <div className="grid h-[70vh] min-h-[520px] place-items-center p-8 text-center">
            <div>
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-rose-200 border-t-rose-700" />
              <p className="mt-4 text-sm font-medium text-rose-900/75">
                Preparing the gallery...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
