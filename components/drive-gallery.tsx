"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import type { DriveImage } from "@/lib/google-drive";

const loadedImageSources = new Set<string>();

type GalleryImageProps = {
  sources: string[];
  alt: string;
  fill?: boolean;
  loading?: "lazy" | "eager";
  className: string;
  draggable?: boolean;
  style?: CSSProperties;
};

function GalleryImage({
  sources,
  alt,
  fill = false,
  loading = "lazy",
  className,
  draggable = false,
  style,
}: GalleryImageProps) {
  const [srcIndex, setSrcIndex] = useState(0);
  const src = sources[srcIndex] ?? sources[0];
  const [loaded, setLoaded] = useState(() => loadedImageSources.has(src));

  useEffect(() => {
    setLoaded(loadedImageSources.has(src));
  }, [src]);

  return (
    <>
      {!loaded ? (
        <div
        className={`grid place-items-center text-xl animate-pulse bg[linear-gradient(90deg,rgba(247,220,204,0.7),rgba(255,246,239,0.95),rgba(247,220,204,0.7))] bg-[length:200%_100%]  font-semibold text-rose-800 ${fill ? "absolute inset-0" : ""} ${className}`}
        >
          loading ...
        </div>
      ) : null}
      <img
        src={src}
      alt={alt}
      loading={loading}
      decoding="async"
      referrerPolicy="no-referrer"
      draggable={draggable}
      style={style}
      className={`${fill ? "absolute inset-0 cursor-pointer h-full w-full" : ""} ${className} ${loaded ? "opacity-100" : "opacity-0"}`}
      onLoad={() => {
        loadedImageSources.add(src);
        setLoaded(true);
      }}
        onError={() => {
          if (srcIndex < sources.length - 1) {
            setLoaded(false);
            setSrcIndex(srcIndex + 1);
          } else {
            setLoaded(true);
          }
        }}
      />
    </>
  );
}

type DriveGalleryProps = {
  images: DriveImage[];
  title: string;
};

export default function DriveGallery({ images, title }: DriveGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [rotation, setRotation] = useState(0);
  const isSideways = rotation % 180 !== 0;

  useEffect(() => {
    if (activeIndex === null) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveIndex(null);
      } else if (event.key === "ArrowLeft") {
        setActiveIndex((current) =>
          current === null
            ? current
            : (current - 1 + images.length) % images.length,
        );
      } else if (event.key === "ArrowRight") {
        setActiveIndex((current) =>
          current === null ? current : (current + 1) % images.length,
        );
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [activeIndex, images.length]);

  if (images.length === 0) {
    return (
      <div className="rounded-xl border border-rose-900/10 bg-white/70 p-6 text-sm text-rose-900/75 shadow-[0_18px_45px_rgba(102,35,49,0.08)]">
        Gallery images could not be loaded from Google Drive.
      </div>
    );
  }

  const currentImage = activeIndex === null ? null : images[activeIndex];

  function showPrevious() {
    setRotation(0);
    setActiveIndex((current) =>
      current === null ? 0 : (current - 1 + images.length) % images.length,
    );
  }

  function showNext() {
    setRotation(0);
    setActiveIndex((current) =>
      current === null ? 0 : (current + 1) % images.length,
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => {
              setRotation(0);
              setActiveIndex(index);
            }}
            className="group relative overflow-hidden rounded-lg border border-rose-900/10 bg-white shadow-[0_10px_28px_rgba(102,35,49,0.08)]"
          >
            <div className="relative aspect-[4/5]">
              <GalleryImage
                key={image.id}
                sources={image.thumbSources}
                alt={`${title} ${index + 1}`}
                fill
                loading="lazy"
                className="object-cover transition duration-300 group-hover:scale-[1.03]"
                draggable={false}
              />
            </div>
          </button>
        ))}
      </div>

      {currentImage ? (
        <div className="fixed inset-0 z-50 bg-[rgba(28,10,16,0.96)]">
          <button
            type="button"
            aria-label="Close preview"
            onClick={() => {
              setRotation(0);
              setActiveIndex(null);
            }}
            className="absolute right-3 top-3 z-20 grid h-11 w-11 place-items-center rounded-full bg-white/12 text-3xl leading-none text-white backdrop-blur hover:bg-white/18 md:right-6 md:top-6"
          >
            {"\u{1F5D9}"}
          </button>

          <button
            type="button"
            aria-label="Rotate image"
            onClick={() => setRotation((current) => (current + 90) % 360)}
            className="absolute right-3 top-16 z-20 grid h-11 w-11 place-items-center rounded-full bg-white/12 text-3xl leading-none text-white backdrop-blur hover:bg-white/18 md:right-6 md:top-20"
          >
            {"\u21BB"}
          </button>

          <div className="flex h-full flex-col pb-4 md:px-6 md:pb-6 md:pt-6">
            <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden">
              <button
                type="button"
                aria-label="Previous image"
                onClick={showPrevious}
                className="absolute left-3 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/12 text-3xl text-white backdrop-blur hover:bg-white/18 md:grid"
              >
                {"\u2039"}
              </button>

              <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
                <div
                  className="relative flex h-full w-full items-center justify-center transition-transform duration-300 ease-out"
                >
                  <GalleryImage
                    key={`${currentImage.id}-${rotation}`}
                    sources={currentImage.fullSources}
                    alt={`${title} preview`}
                    loading="eager"
                    className="object-contain"
                    draggable={false}
                    style={{
                      maxWidth: isSideways ? "100vh" : "100vw",
                      maxHeight: isSideways ? "100vw" : "100vh",
                      transform: `rotate(${rotation}deg)`,
                      transformOrigin: "center center",
                    }}
                  />
                </div>
              </div>

              <button
                type="button"
                aria-label="Next image"
                onClick={showNext}
                className="absolute right-3 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/12 text-3xl text-white backdrop-blur hover:bg-white/18 md:grid"
              >
                {"\u203A"}
              </button>
            </div>

            <div className="mt-3 hidden gap-3 overflow-x-auto pb-1 md:flex">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`relative h-20 w-16 shrink-0 overflow-hidden rounded-lg border transition ${
                    activeIndex === index
                      ? "border-rose-200 shadow-[0_0_0_2px_rgba(255,255,255,0.2)]"
                      : "border-white/10 opacity-70"
                  }`}
                >
                  <GalleryImage
                    key={image.id}
                    sources={image.thumbSources}
                    alt={`${title} thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    draggable={false}
                  />
                </button>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-center gap-4 md:hidden">
              <button
                type="button"
                aria-label="Previous image"
                onClick={showPrevious}
                className="grid h-12 w-12 place-items-center rounded-full bg-white/12 text-3xl text-white backdrop-blur"
              >
                {"\u2039"}
              </button>
              <p className="min-w-20 text-center text-sm font-medium text-white/80">
                {(activeIndex ?? 0) + 1} / {images.length}
              </p>
              <button
                type="button"
                aria-label="Next image"
                onClick={showNext}
                className="grid h-12 w-12 place-items-center rounded-full bg-white/12 text-3xl text-white backdrop-blur"
              >
                {"\u203A"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
