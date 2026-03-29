"use client";

import { useEffect, useState } from "react";

type VideoItem = {
  title: string;
  length: string;
  note: string;
  embedUrl?: string;
};

type VideoGalleryProps = {
  items: VideoItem[];
};

function getEmbedSrc(embedUrl: string, autoplay = false) {
  const videoId = embedUrl.split("/embed/")[1]?.split("?")[0];

  if (!videoId) {
    return embedUrl;
  }

  const params = new URLSearchParams({
    autoplay: autoplay ? "1" : "0",
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
    iv_load_policy: "3",
    color: "white",
  });

  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

export default function VideoGallery({ items }: VideoGalleryProps) {
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const [shouldRotatePreview, setShouldRotatePreview] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1023px)");

    function updateRotationPreference(event?: MediaQueryListEvent) {
      setShouldRotatePreview(event?.matches ?? mediaQuery.matches);
    }

    updateRotationPreference();
    mediaQuery.addEventListener("change", updateRotationPreference);

    return () => {
      mediaQuery.removeEventListener("change", updateRotationPreference);
    };
  }, []);

  useEffect(() => {
    if (activeVideo === null) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveVideo(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [activeVideo]);

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-2">
        {items.map((item) => {
          const isPlayable = Boolean(item.embedUrl);

          return (
            <article
              key={item.title}
              className="grid gap-4 rounded-md border border-rose-900/10 bg-[linear-gradient(140deg,rgba(255,255,255,0.88),rgba(251,230,219,0.8))] p-5 shadow-[0_10px_24px_rgba(102,35,49,0.1)] md:grid-cols-[220px_1fr]"
            >
              {isPlayable ? (
                <button
                  type="button"
                  onClick={() => setActiveVideo(item)}
                  className="group relative grid h-40 place-items-center overflow-hidden rounded-[18px] bg-[radial-gradient(circle_at_top,#f1c8b2,transparent_55%),linear-gradient(135deg,#8f3d34,#c86f5a,#f1c8b2)] shadow-[0_10px_24px_rgba(102,35,49,0.14)]"
                >
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(0,0,0,0.18))]" />
                  <div className="relative flex flex-col items-center gap-3 text-white">
                    <span className="grid h-14 w-14 place-items-center rounded-full bg-white/90 text-rose-950 shadow-[0_10px_30px_rgba(0,0,0,0.2)] transition group-hover:scale-105">
                      <span className="ml-1 text-lg">▶</span>
                    </span>
                    <span className="text-xs font-semibold tracking-[0.28em]">
                      WATCH
                    </span>
                  </div>
                </button>
              ) : (
                <div className="grid h-40 place-items-center rounded-[18px] bg-[linear-gradient(135deg,#dd9f85,#efc0a8,#f8e5d6)] text-sm font-bold tracking-[0.25em] text-white">
                  PLAY
                </div>
              )}

              <div className="flex flex-col justify-center">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-xl font-semibold text-rose-950">
                    {item.title}
                  </h3>
                  <span className="rounded-full bg-white/75 px-3 py-1 text-xs font-semibold text-rose-900">
                    {item.length}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-rose-900/75">
                  {item.note}
                </p>
              </div>
            </article>
          );
        })}
      </div>

      {activeVideo ? (
        <div className="fixed inset-0 z-50 bg-[rgba(20,8,11,0.96)]">
          <button
            type="button"
            aria-label="Close video preview"
            onClick={() => setActiveVideo(null)}
            className="absolute right-3 top-3 z-20 grid h-11 w-11 place-items-center rounded-full bg-white/12 text-3xl leading-none text-white backdrop-blur hover:bg-white/18 md:right-6 md:top-6"
          >
            {"\u00D7"}
          </button>

          <div className="flex h-full w-full items-center justify-center overflow-hidden p-0 md:p-4 lg:p-8">
            {shouldRotatePreview ? (
              <div className="flex h-screen w-screen items-center justify-center overflow-hidden bg-black">
                <div
                  className="shrink-0 overflow-hidden bg-black"
                  style={{
                    width: "100svh",
                    height: "100svw",
                    transform: "rotate(90deg)",
                    transformOrigin: "center center",
                  }}
                >
                  <iframe
                    src={getEmbedSrc(activeVideo.embedUrl ?? "", true)}
                    title={`${activeVideo.title} fullscreen preview`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    className="h-full w-full"
                  />
                </div>
              </div>
            ) : (
              <div className="w-full max-w-6xl overflow-hidden rounded-[24px] bg-black shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
                <iframe
                  src={getEmbedSrc(activeVideo.embedUrl ?? "", true)}
                  title={`${activeVideo.title} fullscreen preview`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  className="aspect-video w-full"
                />
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
