"use client";

import type { CSSProperties, ReactNode } from "react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import CloseIcon from "@/components/icons/close-icon";
import { getFirebaseAuth } from "@/lib/firebase-client";
import { hasFirebaseConfig, onLocalAuthStateChanged } from "@/lib/local-auth";
import type { DriveImage } from "@/lib/google-drive";
import { createGalleryImageLoader } from "@/lib/gallery-image-loader";
import HeartIcon from "@/components/icons/heart-icon";
import { toggleLikedImage, useLikedImages } from "@/lib/liked-images";

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

// Move the decoded Image object into a single host before the browser paints.
// Replacing the child atomically avoids both black frames and overlapping photos.
function SlideshowPhoto({ image, alt, paused }: { image: HTMLImageElement; alt: string; paused: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    image.setAttribute("alt", alt);
    image.setAttribute("draggable", "false");
    image.setAttribute("class", "h-full w-full object-contain");
    host.current?.replaceChildren(image);
    return () => { image.remove(); };
  }, [image, alt]);
  return <div key={image.src} ref={host} className="slideshow-ken-burns absolute inset-0 flex items-center justify-center" style={{ animationPlayState: paused ? "paused" : "running" }} />;
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 10.7 6.8-3.4" />
      <path d="m8.6 13.3 6.8 3.4" />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
    </svg>
  );
}

function SlideshowIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="4" width="20" height="14" rx="2" />
      <path d="m10 9 5 3-5 3V9z" fill="currentColor" stroke="none" />
      <path d="M8 21h8" />
      <path d="M12 19v2" />
    </svg>
  );
}

function loadBlobImage(blob: Blob) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(blob);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Image could not be prepared for sharing."));
    };
    image.src = objectUrl;
  });
}

async function rotateImageBlob(blob: Blob, rotation: number) {
  const normalizedRotation = ((rotation % 360) + 360) % 360;

  if (normalizedRotation === 0) {
    return blob;
  }

  const image = await loadBlobImage(blob);
  const isSidewaysRotation = normalizedRotation % 180 !== 0;
  const canvas = document.createElement("canvas");
  canvas.width = isSidewaysRotation ? image.naturalHeight : image.naturalWidth;
  canvas.height = isSidewaysRotation ? image.naturalWidth : image.naturalHeight;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Image could not be rotated for sharing.");
  }

  context.translate(canvas.width / 2, canvas.height / 2);
  context.rotate((normalizedRotation * Math.PI) / 180);
  context.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (rotatedBlob) => {
        if (rotatedBlob) {
          resolve(rotatedBlob);
        } else {
          reject(new Error("Image could not be rotated for sharing."));
        }
      },
      "image/jpeg",
      0.95,
    );
  });
}

type DriveGalleryProps = {
  images: DriveImage[];
  title: string;
  getTileLabel?: (image: DriveImage, index: number) => string;
  onViewerOpenChange?: (open: boolean) => void;
  getGroupLabel?: (image: DriveImage) => string;
  onImageUnliked?: (image: DriveImage) => void;
  headerActions?: ReactNode;
};

const SLIDESHOW_INTERVAL_MS = 7000;
const SLIDESHOW_TICK_MS = 50;


export default function DriveGallery({
  images,
  title,
  getTileLabel,
  onViewerOpenChange,
  getGroupLabel,
  onImageUnliked,
  headerActions,
}: DriveGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const likedImages = useLikedImages();
  const [likeError, setLikeError] = useState("");
  const [rotation, setRotation] = useState(0);
  const [currentEmail, setCurrentEmail] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const desktopThumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const mobileThumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Slideshow state
  const [slideshowActive, setSlideshowActive] = useState(false);
  const [slideshowIndex, setSlideshowIndex] = useState(0);
  const [preparedSlide, setPreparedSlide] = useState<{ index: number; image: HTMLImageElement } | null>(null);
  const [loadSlideshowImage] = useState(() => createGalleryImageLoader());
  const [slideError, setSlideError] = useState("");
  const [slideshowPaused, setSlideshowPaused] = useState(false);
  const [slideshowProgress, setSlideshowProgress] = useState(0);
  const slideshowElapsedRef = useRef(0);
  const isSideways = rotation % 180 !== 0;
  const viewerOpen = activeIndex !== null || slideshowActive;

  useEffect(() => {
    onViewerOpenChange?.(viewerOpen);
  }, [viewerOpen, onViewerOpenChange]);

  function toggleLike(image: DriveImage) {
    const tileTitle = getTileLabel?.(image, images.findIndex(item => item.id === image.id));
    const originalTitle = "title" in image && typeof image.title === "string" ? image.title : tileTitle || title;
    const wasLiked = likedImages.some(item => item.id === image.id);
    const saved = toggleLikedImage(image, originalTitle);
    setLikeError(saved ? "" : "Could not save your love. Please allow browser storage and try again.");
    if (saved && wasLiked) onImageUnliked?.(image);
  }

  function renderLikeButton(image: DriveImage, tileIndex?: number) {
    const liked = likedImages.some(item => item.id === image.id);
    const isTile = tileIndex !== undefined;
    const label = `${liked ? "Unlike" : "Like"} ${isTile ? `${title} photo ${tileIndex + 1}` : "image"}`;
    return <button type="button" aria-label={label} aria-pressed={liked} title={liked ? "Unlike image" : "Like image"} onClick={() => toggleLike(image)} className={`absolute grid place-items-center rounded-full text-white backdrop-blur transition hover:scale-110 ${isTile ? "gallery-tile-heart bottom-2 right-2 z-20 h-8 w-8" : "bottom-40 right-3 z-40 h-11 w-11 md:right-6"} ${liked ? "bg-rose-800 hover:bg-rose-900" : isTile ? "bg-black/40 hover:bg-black/60" : "bg-white/15 hover:bg-white/25"}`}><HeartIcon className={isTile ? "h-4 w-4" : "h-6 w-6"} filled={liked} /></button>;
  }

  // Keep the currently displayed photo until the requested photo is fully decoded.
  useEffect(() => {
    if (!slideshowActive || !images[slideshowIndex]) return;
    let cancelled = false;
    const photo = images[slideshowIndex];
    void loadSlideshowImage([...photo.fullSources, ...photo.thumbSources]).then((image) => {
      if (cancelled) return;
      loadedImageSources.add(image.src);
      setPreparedSlide({ index: slideshowIndex, image });
      setSlideError("");
      setSlideshowProgress(0);
      slideshowElapsedRef.current = 0;
    }).catch(() => {
      if (cancelled) return;
      setSlideError("This photo could not be loaded. Try the next or previous photo.");
      setSlideshowPaused(true);
    });
    return () => { cancelled = true; };
  }, [slideshowActive, slideshowIndex, images, loadSlideshowImage]);

  // Only the next photo is prepared in the background; it is never rendered here.
  useEffect(() => {
    if (!slideshowActive || !preparedSlide || images.length < 2) return;
    const next = images[(preparedSlide.index + 1) % images.length];
    if (next) void loadSlideshowImage([...next.fullSources, ...next.thumbSources]).catch(() => {});
  }, [slideshowActive, preparedSlide, images, loadSlideshowImage]);

  const advanceSlide = useCallback((currentIdx: number, direction = 1) => {
    if (!images.length) return;
    setSlideshowIndex((currentIdx + direction + images.length) % images.length);
    setSlideError("");
    setSlideshowProgress(0);
    slideshowElapsedRef.current = 0;
  }, [images.length]);

  // One timer owns playback. Pause retains elapsed time; loading never consumes it.
  useEffect(() => {
    if (!slideshowActive || slideshowPaused || !preparedSlide ||
        preparedSlide.index !== slideshowIndex || images.length < 2) return;
    const startedAt = performance.now() - slideshowElapsedRef.current;
    const timer = window.setInterval(() => {
      slideshowElapsedRef.current = performance.now() - startedAt;
      setSlideshowProgress(Math.min(slideshowElapsedRef.current / SLIDESHOW_INTERVAL_MS, 1));
      if (slideshowElapsedRef.current >= SLIDESHOW_INTERVAL_MS) {
        window.clearInterval(timer);
        advanceSlide(slideshowIndex);
      }
    }, SLIDESHOW_TICK_MS);
    return () => window.clearInterval(timer);
  }, [slideshowActive, slideshowPaused, slideshowIndex, preparedSlide, images.length, advanceSlide]);

  // Keyboard controls for slideshow
  useEffect(() => {
    if (!slideshowActive) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setSlideshowActive(false);
        document.body.style.overflow = "";
      } else if (e.key === "ArrowRight") {
        advanceSlide(slideshowIndex);
      } else if (e.key === "ArrowLeft") {
        advanceSlide(slideshowIndex, -1);
      } else if (e.key === " ") {
        e.preventDefault();
        setSlideshowPaused((p) => !p);
      }
    }

    window.addEventListener("keydown", handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [slideshowActive, slideshowIndex, advanceSlide]);

  function startSlideshow(startIndex = 0) {
    setSlideshowIndex(startIndex);
    setPreparedSlide(null);
    setSlideError("");
    setSlideshowProgress(0);
    slideshowElapsedRef.current = 0;
    setSlideshowPaused(false);
    setSlideshowActive(true);
    // Enter native browser fullscreen (like F11)
    document.documentElement.requestFullscreen?.().catch(() => {
      // Fullscreen blocked (e.g. browser policy) — slideshow still works normally
    });
  }

  function exitSlideshow() {
    setSlideshowActive(false);
    setSlideshowPaused(false);
    document.body.style.overflow = "";
    // Exit native fullscreen if active
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }
  }

  // ── Sync slideshow with native fullscreen ──────────────────────────────────
  // If the user exits fullscreen (F11 / browser Esc) while slideshow is active,
  // close the slideshow so the UI stays consistent.
  useEffect(() => {
    function onFullscreenChange() {
      if (!document.fullscreenElement && slideshowActive) {
        setSlideshowActive(false);
        setSlideshowPaused(false);
        document.body.style.overflow = "";
      }
    }
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, [slideshowActive]);

  // ── Lightbox keyboard/auth effects ────────────────────────────────────────

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
            : (current - 1 + images.length) % images.length,
        );
      } else if (event.key === "ArrowRight") {
        setRotation(0);
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
      current === null ? 0 : (current - 1 + images.length) % images.length,
    );
  }
  

  function showNext() {
    setRotation(0);
    setActiveIndex((current) =>
      current === null ? 0 : (current + 1) % images.length,
    );
  }

  async function shareCurrentImage() {
    if (!currentImage || !downloadName || isSharing) return;

    setIsSharing(true);
    setShareMessage("");

    try {
      const response = await fetch(
        `/api/drive/image/${currentImage.id}?size=2000`,
      );

      if (!response.ok) {
        throw new Error("Image could not be loaded for sharing.");
      }

      const blob = await response.blob();
      const shareBlob = await rotateImageBlob(blob, rotation);
      const imageFile = new File([shareBlob], downloadName, {
        type: shareBlob.type || "image/jpeg",
      });
      const shareData = {
        files: [imageFile],
        title,
      };

      if (navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
        return;
      }

      const objectUrl = URL.createObjectURL(shareBlob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = downloadName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
      setShareMessage(
        "Sharing images is not supported here, so the image was downloaded.",
      );
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      setShareMessage("Could not share this image. Please try downloading it.");
    } finally {
      setIsSharing(false);
    }
  }

  const slideshowImage = images[slideshowIndex];
  const groupedImages = new Map<string, { image: DriveImage; index: number }[]>();
  images.forEach((image, index) => {
    const label = getGroupLabel?.(image) ?? "";
    const entries = groupedImages.get(label) ?? [];
    entries.push({ image, index });
    groupedImages.set(label, entries);
  });



  return (
    <>
      {/* Gallery Header with Slideshow Button */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className={`text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-800/60 sm:text-xs ${headerActions ? "w-full sm:w-auto" : ""}`}>
          {images.length} {images.length === 1 ? "photo" : "photos"}
        </p>
        <div className={`flex flex-wrap items-center gap-2 ${headerActions ? "w-full sm:w-auto" : ""}`}>
        {headerActions}
        <button
          type="button"
          onClick={() => startSlideshow()}
          className={`inline-flex min-h-10 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-rose-800 px-3 py-2 text-xs font-semibold text-rose-50 transition hover:bg-rose-900 active:scale-95 sm:px-4 sm:text-sm ${headerActions ? "flex-1 sm:flex-none" : ""}`}
        >
          <SlideshowIcon className="h-4 w-4" />
          Slideshow
        </button>
        </div>
      </div>

      {/* Grid Gallery */}
      {!viewerOpen && likeError ? <p role="alert" className="mb-3 text-sm text-rose-900">{likeError}</p> : null}
      <div className="space-y-10">
      {[...groupedImages].map(([group, entries]) => <section key={group} className="space-y-4">
        {group && <h2 className="border-b border-rose-900/10 pb-3 font-serif text-2xl font-bold text-rose-950">{group}<span className="ml-3 font-sans text-sm font-normal text-rose-900/60">{entries.length} {entries.length === 1 ? "photo" : "photos"}</span></h2>}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {entries.map(({ image, index }) => (
          <div
            key={image.id}
            className="group relative overflow-hidden rounded-lg border border-rose-900/10 bg-white shadow-[0_10px_28px_rgba(102,35,49,0.08)]"
          >
            <button type="button" aria-label={`Open ${title} photo ${index + 1}`} onClick={() => { setRotation(0); setActiveIndex(index); }} className="relative block aspect-[4/5] w-full cursor-pointer">
              <GalleryImage
                sources={image.thumbSources}
                alt={`${title} ${index + 1}`}
                fill
                loading="lazy"
                className="object-cover transition duration-300 group-hover:scale-[1.03]"
                draggable={false}
              />
              {getTileLabel ? (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent,rgba(28,10,16,0.82))] py-3 pl-3 pr-12 text-left">
                  <p className="text-sm font-semibold text-white">
                    {getTileLabel(image, index)}
                  </p>
                </div>
              ) : null}
            </button>
            {renderLikeButton(image, index)}
          </div>
        ))}
        </div>
      </section>)}
      </div>

      {/* ── Slideshow Overlay ───────────────────────────────────────────────── */}
      {slideshowActive && slideshowImage ? (
        <div data-gallery-viewer="true" className="fixed inset-0 z-[100] bg-black flex flex-col">
          {preparedSlide && images[preparedSlide.index] ? renderLikeButton(images[preparedSlide.index]) : null}
          {likeError ? <p role="alert" className="absolute bottom-28 right-3 z-40 max-w-64 rounded-lg bg-black/80 p-3 text-sm text-white">{likeError}</p> : null}
          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 z-40 h-[3px] bg-white/20">
            <div
              className="h-full bg-rose-300 transition-none"
              style={{ width: `${slideshowProgress * 100}%` }}
            />
          </div>

          {/* Top controls */}
          <div className="absolute right-3 top-4 z-40 flex items-center gap-2 md:right-6 md:top-5">
            {/* Counter */}
            <span className="rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur">
              {(preparedSlide?.index ?? slideshowIndex) + 1} / {images.length}
            </span>

            {/* Pause / Resume */}
            <button
              type="button"
              aria-label={slideshowPaused ? "Resume slideshow" : "Pause slideshow"}
              onClick={() => setSlideshowPaused((p) => !p)}
              className="grid h-10 w-10 place-items-center rounded-full bg-white/12 text-white backdrop-blur hover:bg-white/20"
            >
              {slideshowPaused ? (
                <PlayIcon className="h-5 w-5" />
              ) : (
                <PauseIcon className="h-5 w-5" />
              )}
            </button>

            {/* Exit */}
            <button
              type="button"
              aria-label="Exit slideshow"
              onClick={exitSlideshow}
              className="grid h-10 w-10 place-items-center rounded-full bg-white/12 text-white backdrop-blur hover:bg-white/20"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Previous / Next nav */}
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => advanceSlide(slideshowIndex, -1)}
            className="absolute left-3 top-1/2 z-40 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/12 text-3xl text-white backdrop-blur hover:bg-white/20 md:grid"
          >
            {"‹"}
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => advanceSlide(slideshowIndex)}
            className="absolute right-3 top-1/2 z-40 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/12 text-3xl text-white backdrop-blur hover:bg-white/20 md:grid"
          >
            {"›"}
          </button>

          {/* A single decoded photo is displayed. Preloads stay outside the DOM. */}
          <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-black">
            {preparedSlide ? (
              <SlideshowPhoto
                image={preparedSlide.image}
                alt={`${title} ${preparedSlide.index + 1}`}
                paused={slideshowPaused || preparedSlide.index !== slideshowIndex}
              />
            ) : <p role="status" className="text-sm text-white/80">Preparing your photo...</p>}
            {slideError ? <p role="alert" className="absolute bottom-24 z-40 rounded-lg bg-black/70 px-4 py-2 text-sm text-white">{slideError}</p> : null}

            {/* Subtle dark vignette */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.55))]" />

            {/* Caption */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-[linear-gradient(0deg,rgba(0,0,0,0.7),transparent)] px-6 py-8 text-center">
              <p className="text-sm font-semibold tracking-widest text-rose-200/80 uppercase">
                {title}
              </p>
            </div>
          </div>

          {/* Mobile prev/next */}
          <div className="flex items-center justify-center gap-6 py-4 md:hidden">
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => advanceSlide(slideshowIndex, -1)}
              className="grid h-12 w-12 place-items-center rounded-full bg-white/12 text-3xl text-white backdrop-blur"
            >
              {"‹"}
            </button>
            <button
              type="button"
              aria-label={slideshowPaused ? "Resume slideshow" : "Pause slideshow"}
              onClick={() => setSlideshowPaused((p) => !p)}
              className="grid h-12 w-12 place-items-center rounded-full bg-white/12 text-white backdrop-blur"
            >
              {slideshowPaused ? (
                <PlayIcon className="h-6 w-6" />
              ) : (
                <PauseIcon className="h-6 w-6" />
              )}
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={() => advanceSlide(slideshowIndex)}
              className="grid h-12 w-12 place-items-center rounded-full bg-white/12 text-3xl text-white backdrop-blur"
            >
              {"›"}
            </button>
          </div>
        </div>
      ) : null}

      {/* Fullscreen Preview (lightbox) */}
      {currentImage ? (
        <div data-gallery-viewer="true" className="fixed inset-0 z-[100] bg-[rgba(28,10,16,0.96)]">
          {renderLikeButton(currentImage)}
          {likeError ? <p role="alert" className="absolute bottom-28 right-3 z-40 max-w-64 rounded-lg bg-black/80 p-3 text-sm text-white">{likeError}</p> : null}
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
              {"↻"}
            </button>

            {/* Slideshow — starts from current image */}
            <button
              type="button"
              aria-label="Start slideshow from this image"
              title="Slideshow"
              onClick={() => {
                const startIdx = activeIndex ?? 0;
                setRotation(0);
                setActiveIndex(null);
                startSlideshow(startIdx);
              }}
              className="grid h-11 w-11 place-items-center rounded-full bg-white/12 text-white backdrop-blur hover:bg-white/18"
            >
              <SlideshowIcon className="h-5 w-5" />
            </button>

            {!shouldHideDownloadButton ? (
              <button
                type="button"
                aria-label="Share image"
                title="Share image"
                onClick={shareCurrentImage}
                disabled={isSharing}
                className="grid h-11 w-11 place-items-center rounded-full bg-white/12 text-white backdrop-blur hover:bg-white/18 disabled:cursor-wait disabled:opacity-60"
              >
                <ShareIcon className="h-5 w-5" />
              </button>
            ) : null}

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

          {shareMessage ? (
            <p className="absolute left-1/2 top-4 z-30 max-w-[calc(100vw-7rem)] -translate-x-1/2 rounded-full bg-white/14 px-4 py-2 text-center text-xs font-medium text-white backdrop-blur md:top-6">
              {shareMessage}
            </p>
          ) : null}

          <div className="flex h-full w-full flex-col md:px-6 md:pt-2">
            <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden">
              {/* Previous Button */}
              <button
                type="button"
                aria-label="Previous image"
                onClick={showPrevious}
                className="absolute left-3 top-1/2 z-30 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/12 text-3xl text-white backdrop-blur hover:bg-white/18 md:grid"
              >
                {"‹"}
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
                {"›"}
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
                {"‹"}
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
                {"›"}
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
