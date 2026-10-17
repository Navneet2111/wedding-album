"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import DriveGallery from "@/components/drive-gallery";
import PhotoDownloadFeedback from "@/components/photo-download-feedback";
import { usePhotoDownload } from "@/hooks/use-photo-download";
import HeartIcon from "@/components/icons/heart-icon";
import type { DriveImage } from "@/lib/google-drive";
import {
  type LikedImage,
  restoreLikedImage,
  useLikedImages,
} from "@/lib/liked-images";
import { getLikedImageGroup, groupLikedImages } from "@/lib/liked-image-groups";

type UndoRemoval = { image: LikedImage; index: number; expiresAt: number };
const UNDO_DURATION_MS = 5000;

export default function LikedImagesGallery() {
  const liked = useLikedImages();
  // Preserve the open viewer's order until it closes, including after a removal.
  const [viewingImages, setViewingImages] = useState<LikedImage[] | null>(null);
  const onViewerOpenChange = useCallback(
    (open: boolean) => {
      setViewingImages((current) => (open ? (current ?? liked) : null));
    },
    [liked],
  );
  const collection = viewingImages ?? liked;
  const images = useMemo(
    () => groupLikedImages(collection).flatMap(([, photos]) => photos),
    [collection],
  );
  const ceremonyCount = groupLikedImages(liked).length;
  const [pendingRemovals, setPendingRemovals] = useState<UndoRemoval[]>([]);
  const [undoError, setUndoError] = useState("");
  const download = usePhotoDownload();
  const { downloading, triggerRef: downloadButton } = download;

  useEffect(() => {
    if (!pendingRemovals.length) return;
    const nextExpiry = Math.min(
      ...pendingRemovals.map((item) => item.expiresAt),
    );
    const timer = window.setTimeout(
      () => {
        setPendingRemovals((current) =>
          current.filter((item) => item.expiresAt > Date.now()),
        );
      },
      Math.max(0, nextExpiry - Date.now()),
    );
    return () => window.clearTimeout(timer);
  }, [pendingRemovals]);

  const onImageUnliked = useCallback(
    (image: DriveImage) => {
      const saved =
        liked.find((item) => item.id === image.id) ??
        collection.find((item) => item.id === image.id);
      if (!saved) return;
      const removal = {
        image: saved,
        index: Math.max(
          0,
          liked.findIndex((item) => item.id === image.id),
        ),
        expiresAt: Date.now() + UNDO_DURATION_MS,
      };
      setUndoError("");
      setPendingRemovals((current) => [
        ...current.filter((item) => item.image.id !== image.id),
        removal,
      ]);
    },
    [liked, collection],
  );

  const undoRemoval = useCallback((removal: UndoRemoval) => {
    if (Date.now() >= removal.expiresAt) return;
    if (!restoreLikedImage(removal.image, removal.index)) {
      setUndoError(
        "Could not restore this photo. Please allow browser storage and try again.",
      );
      return;
    }
    setPendingRemovals((current) => current.filter((item) => item !== removal));
    setUndoError("");
  }, []);

  function downloadAll() {
    void download.start(liked);
  }

  const undoable = pendingRemovals.filter(
    (item) => !liked.some((photo) => photo.id === item.image.id),
  );

  const downloadActions =
    liked.length > 0 || downloading ? (
        <button
          type="button"
          ref={downloadButton}
          onClick={downloadAll}
          disabled={downloading}
          className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-rose-800/20 bg-white/80 px-3 py-2 text-xs font-semibold text-rose-900 transition hover:bg-rose-50 disabled:cursor-wait disabled:opacity-60 sm:flex-none sm:px-4 sm:text-sm"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 shrink-0"
          >
            <path d="M12 3v12m-5-5 5 5 5-5M5 16v5h14v-5" />
          </svg>
          Download all
          <span className="hidden sm:inline"> ({liked.length})</span>
        </button>
    ) : null;

  return (
    <section className="loved-images-gallery space-y-4 lg:space-y-6">
      <div className="hidden gap-6 lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <div className="relative hidden min-h-88 overflow-hidden rounded-xl border border-rose-900/10 bg-rose-100 shadow-[0_18px_45px_rgba(102,35,49,0.14)] lg:block">
          <Image
            src={collection[0]?.thumbSources[0] ?? "/wedding.JPG"}
            alt="A favourite moment from your wedding memories"
            fill
            unoptimized
            sizes="(max-width: 1024px) 90vw, 55vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(55,18,28,0.04),rgba(55,18,28,0.78))]" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-rose-100/90">
              Close to your heart
            </p>
            <h2 className="mt-3 font-serif text-4xl font-bold">Loved Images</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-rose-50/90">
              The smiles, the celebrations, the little moments you never want to
              forget.
            </p>
          </div>
        </div>
        <div className="lg:rounded-xl lg:border lg:border-rose-900/10 lg:bg-[linear-gradient(145deg,rgba(255,255,255,0.92),rgba(248,231,220,0.82))] lg:p-6 lg:shadow-[0_18px_45px_rgba(102,35,49,0.12)]">
          <div className="hidden lg:block">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-800/75">
              Your personal collection
            </p>
            <h3 className="mt-4 font-serif text-3xl font-bold text-rose-950">
              Your favourites, all together.
            </h3>
            <p className="mt-4 text-sm leading-7 text-rose-900/75">
              Every photo here is a moment you love. Explore them by ceremony,
              relive them in one slideshow, or save every photo together.
            </p>
            <div className="mt-5 flex flex-wrap gap-3 text-sm text-rose-900">
              <span className="inline-flex items-center gap-2 rounded-full border border-rose-900/10 bg-white/70 px-4 py-2">
                <HeartIcon className="h-4 w-4" filled />
                {liked.length} loved {liked.length === 1 ? "photo" : "photos"}
              </span>
              <span className="rounded-full border border-rose-900/10 bg-white/70 px-4 py-2">
                {ceremonyCount}{" "}
                {ceremonyCount === 1 ? "ceremony" : "ceremonies"}
              </span>
            </div>
          </div>
        </div>
      </div>
      <PhotoDownloadFeedback download={download} label="Loved Images" />
      {images.length ? (
        <DriveGallery
          images={images}
          title="Loved Images"
          headerActions={downloadActions}
          onViewerOpenChange={onViewerOpenChange}
          onImageUnliked={onImageUnliked}
          getGroupLabel={(image) =>
            getLikedImageGroup(
              "title" in image && typeof image.title === "string"
                ? image.title
                : "Other memories",
            )
          }
        />
      ) : (
        <div className="rounded-3xl border border-dashed border-rose-300 bg-white/60 p-8 text-center text-rose-900">
          <p>No loved images yet.</p>
          <Link
            href="/dashboard/album"
            className="mt-4 inline-block font-semibold underline underline-offset-4"
          >
            Find moments to love
          </Link>
        </div>
      )}
      {(undoable.length > 0 || undoError) && (
        <div className="fixed inset-x-4 bottom-5 z-[150] max-h-[40dvh] space-y-2 overflow-y-auto sm:left-auto sm:right-6 sm:w-96">
          {undoable.map((removal) => (
            <div
              key={`${removal.image.id}-${removal.expiresAt}`}
              role="status"
              className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-white p-4 text-rose-950 shadow-[0_12px_40px_rgba(70,20,35,0.25)]"
            >
              <HeartIcon className="h-5 w-5 shrink-0 text-rose-800" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">Photo removed</p>
                <p className="mt-1 truncate text-xs text-rose-900/65">
                  {getLikedImageGroup(removal.image.title)} · Undo within 5
                  seconds
                </p>
              </div>
              <button
                type="button"
                onClick={() => undoRemoval(removal)}
                aria-label={`Undo removal of ${removal.image.title} photo`}
                className="rounded-full bg-rose-800 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-900"
              >
                Undo
              </button>
            </div>
          ))}
          {undoError && (
            <p
              role="alert"
              className="rounded-xl bg-white p-3 text-sm text-rose-900 shadow-lg"
            >
              {undoError}
            </p>
          )}
        </div>
      )}

    </section>
  );
}
