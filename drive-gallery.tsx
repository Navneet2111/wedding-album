"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import CloseIcon from "@/components/icons/close-icon";
import { getFirebaseAuth } from "@/lib/firebase-client";
import { hasFirebaseConfig, onLocalAuthStateChanged } from "@/lib/local-auth";
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
          className={`grid place-items-center text-xl animate-pulse bg-[linear-gradient(90deg,rgba(247,220,204,0.7),rgba(255,246,239,0.95),rgba(247,220,204,0.7))] bg-[length:200%_100%] font-semibold text-rose-800 ${
            fill ? "absolute inset-0" : ""
          } ${className}`}
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
        className={`${fill ? "absolute inset-0 h-full w-full cursor-pointer" : ""} ${className} ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
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
  getTileLabel?: (image: DriveImage, index: number) => string;
};

export default function DriveGallery({
  images,
  title,
  getTileLabel,
}: DriveGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [rotation, setRotation] = useState(0);
  const [currentEmail, setCurrentEmail] = useState("");
  const desktopThumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const mobileThumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const isSideways = rotation % 180 !== 0;

  useEffect(() => {
    if (!hasFirebaseConfig()) {
      return onLocalAuthStateChanged((user) => {
        setCurrentEmail(user?.email?.toLowerCase() ?? "");
      });
    }

    const auth = getFirebaseAuth();

    return onAuthStateChanged(auth, (user) => {
      setCurrentEmail(user?.email?.toLowerCase() ?? "");
    });
  }, []);

  useEffect(() => {
    if (activeIndex === null) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setRotation(0);
        setActiveIndex(null);
      } else if (event.key === "ArrowLeft") {
        setRotation(0);
        setActiveIndex((current) =>
          current === null
            ? current
            : (current - 1 + images.length) % images.length
        );
      } else if (event.key === "ArrowRight") {
        setRotation(0);
        setActiveIndex((current) =>
          current === null ? current : (current + 1) % images.length
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

  useEffect(() => {
    if (activeIndex === null) return;

    const scrollOptions = {
      behavior: "smooth" as const,
      block: "nearest" as const,
      inline: "center" as const,
    };

    desktopThumbnailRefs.current[activeIndex]?.scrollIntoView(scrollOptions);
    mobileThumbnailRefs.current[activeIndex]?.scrollIntoView(scrollOptions);
  }, [activeIndex]);

  if (images.length === 0) {
    return (
      <div className="rounded-xl border border-rose-900/10 bg-white/70 p-6 text-sm text-rose-900/75 shadow-[0_18px_45px_rgba(102,35,49,0.08)]">
        Gallery images could not be loaded from Google Drive.
      </div>
    );
  }

  const currentImage = activeIndex === null ? null : images[activeIndex];
  const shouldHideDownloadButton = currentEmail.includes("@06");
  const activeImageNumber = activeIndex === null ? null : activeIndex + 1;

  const downloadName =
    currentImage === null || activeImageNumber === null
      ? ""
      : `${
          title
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "") || "image"
        }-${activeImageNumber}.jpg`;

  function showPrevious() {
    setRotation(0);
    setActiveIndex((current) =>
      current === null ? 0 : (current - 1 + images.length) % images.length
    );
  }

  function showNext() {
    setRotation(0);
    setActiveIndex((current) =>
      current === null ? 0 : (current + 1) % images.length
    );
  }

  return (
    <>
      {/* Grid Gallery */}
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
                sources={image.thumbSources}
                alt={`${title} ${index + 1}`}
                fill
                loading="lazy"
                className="object-cover transition duration-300 group-hover:scale-[1.03]"
                draggable={false}
              />
              {getTileLabel ? (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent,rgba(28,10,16,0.82))] px-3 py-3 text-left">
                  <p className="text-sm font-semibold text-white">
                    {getTileLabel(image, index)}
                  </p>
                </div>
              ) : null}
            </div>
          </button>
        ))}
      </div>

      {/* Fullscreen Preview */}
      {currentImage ? (
        <div className="fixed inset-0 z-50 bg-[rgba(28,10,16,0.96)]">
          {/* Top Right Buttons */}
          <div className="absolute right-3 top-3 z-30 flex flex-col gap-3 md:right-6 md:top-6">
            <button
              type="button"
              aria-label="Close preview"
              onClick={() => {
                setRotation(0);
                setActiveIndex(null);
              }}
              className="grid h-11 w-11 place-items-center rounded-full bg-white/12 text-white backdrop-blur hover:bg-white/18"
            >
              <CloseIcon className="h-5 w-5" />
            </button>

            <button
              type="button"
              aria-label="Rotate image"
              onClick={() => setRotation((current) => (current + 90) % 360)}
              className="grid h-11 w-11 place-items-center rounded-full bg-white/12 text-3xl leading-none text-white backdrop-blur hover:bg-white/18"
            >
              {"\u21BB"}
            </button>

            {!shouldHideDownloadButton ? (
              <a
                href={`https://drive.google.com/uc?export=download&id=${currentImage.id}`}
                download={downloadName}
                aria-label="Download image"
                className="grid h-11 w-11 place-items-center rounded-full bg-white/12 text-white backdrop-blur hover:bg-white/18"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 3v11" />
                  <path d="m7 10 5 5 5-5" />
                  <path d="M5 21h14" />
                </svg>
              </a>
            ) : null}
          </div>

          <div className="flex h-full w-full flex-col md:px-6 md:pt-2">
            <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden">
              {/* Previous Button */}
              <button
                type="button"
                aria-label="Previous image"
                onClick={showPrevious}
                className="absolute left-3 top-1/2 z-30 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/12 text-3xl text-white backdrop-blur hover:bg-white/18 md:grid"
              >
                {"\u2039"}
              </button>

              {/* Image + Thumbnail Overlay */}
              <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
                {/* Main Image */}
                <div
                  className="relative flex h-full w-full items-center justify-center transition-transform duration-300 ease-out"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transformOrigin: "center center",
                  }}
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
                    }}
                  />
                </div>

                {/* Thumbnail Strip Over Image */}
                <div
                  className="absolute bottom-4 left-1/2 z-20 hidden max-w-[90%] -translate-x-1/2 gap-3 overflow-x-auto rounded-2xl bg-black/35 px-4 py-3 backdrop-blur md:flex [&::-webkit-scrollbar]:hidden"
                  style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
                >
                  {images.map((image, index) => (
                    <button
                      key={image.id}
                      ref={(element) => {
                        desktopThumbnailRefs.current[index] = element;
                      }}
                      type="button"
                      onClick={() => {
                        setRotation(0);
                        setActiveIndex(index);
                      }}
                      className={`relative h-20 w-16 shrink-0 overflow-hidden rounded-lg border transition ${
                        activeIndex === index
                          ? "scale-105 border-rose-200 shadow-[0_0_0_2px_rgba(255,255,255,0.3)]"
                          : "border-white/20 opacity-75 hover:opacity-100"
                      }`}
                    >
                      <GalleryImage
                        sources={image.thumbSources}
                        alt={`${title} thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                        draggable={false}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Next Button */}
              <button
                type="button"
                aria-label="Next image"
                onClick={showNext}
                className="absolute right-3 top-1/2 z-30 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/12 text-3xl text-white backdrop-blur hover:bg-white/18 md:grid"
              >
                {"\u203A"}
              </button>
            </div>

            {/* Mobile Controls */}
            <div className="mt-3 flex items-center justify-center gap-4 md:hidden mb-3">
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

            {/* Mobile Thumbnail Strip */}
            <div
              className="mt-4 flex gap-3 overflow-x-auto px-4 pb-4 md:hidden [&::-webkit-scrollbar]:hidden"
              style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
            >
              {images.map((image, index) => (
                <button
                  key={image.id}
                  ref={(element) => {
                    mobileThumbnailRefs.current[index] = element;
                  }}
                  type="button"
                  onClick={() => {
                    setRotation(0);
                    setActiveIndex(index);
                  }}
                  className={`relative h-16 w-14 shrink-0 overflow-hidden rounded-lg border transition ${
                    activeIndex === index
                      ? "border-rose-200 shadow-[0_0_0_2px_rgba(255,255,255,0.3)]"
                      : "border-white/20 opacity-75"
                  }`}
                >
                  <GalleryImage
                    sources={image.thumbSources}
                    alt={`${title} mobile thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    draggable={false}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
