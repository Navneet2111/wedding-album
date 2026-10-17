"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import DriveGallery from "@/components/drive-gallery";
import HeartIcon from "@/components/icons/heart-icon";
import type { DriveImage } from "@/lib/google-drive";
import { type LikedImage, restoreLikedImage, useLikedImages } from "@/lib/liked-images";
import { getLikedImageGroup, groupLikedImages } from "@/lib/liked-image-groups";
import { prepareLikedImagesDownload } from "@/lib/download-liked-images";

type UndoRemoval = { image: LikedImage; index: number; expiresAt: number };
const UNDO_DURATION_MS = 5000;

export default function LikedImagesGallery() {
  const liked = useLikedImages();
  // Preserve the open viewer's order until it closes, including after a removal.
  const [viewingImages, setViewingImages] = useState<LikedImage[] | null>(null);
  const onViewerOpenChange = useCallback((open: boolean) => {
    setViewingImages(current => open ? current ?? liked : null);
  }, [liked]);
  const collection = viewingImages ?? liked;
  const images = useMemo(() => groupLikedImages(collection).flatMap(([, photos]) => photos), [collection]);
  const ceremonyCount = groupLikedImages(liked).length;
  const [pendingRemovals, setPendingRemovals] = useState<UndoRemoval[]>([]);
  const [undoError, setUndoError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [downloadMessage, setDownloadMessage] = useState("");
  const downloadController = useRef<AbortController | null>(null);
  useEffect(() => () => downloadController.current?.abort(), []);

  useEffect(() => {
    if (!pendingRemovals.length) return;
    const nextExpiry = Math.min(...pendingRemovals.map(item => item.expiresAt));
    const timer = window.setTimeout(() => {
      setPendingRemovals(current => current.filter(item => item.expiresAt > Date.now()));
    }, Math.max(0, nextExpiry - Date.now()));
    return () => window.clearTimeout(timer);
  }, [pendingRemovals]);

  const onImageUnliked = useCallback((image: DriveImage) => {
    const saved = liked.find(item => item.id === image.id) ?? collection.find(item => item.id === image.id);
    if (!saved) return;
    const removal = { image: saved, index: Math.max(0, liked.findIndex(item => item.id === image.id)), expiresAt: Date.now() + UNDO_DURATION_MS };
    setUndoError("");
    setPendingRemovals(current => [...current.filter(item => item.image.id !== image.id), removal]);
  }, [liked, collection]);

  function undoRemoval(removal: UndoRemoval) {
    if (Date.now() >= removal.expiresAt) return;
    if (!restoreLikedImage(removal.image, removal.index)) {
      setUndoError("Could not restore this photo. Please allow browser storage and try again.");
      return;
    }
    setPendingRemovals(current => current.filter(item => item !== removal));
    setUndoError("");
  }

  async function downloadAll() {
    if (downloadController.current || !liked.length) return;
    const controller = new AbortController();
    downloadController.current = controller;
    setDownloading(true);
    setDownloadMessage("");
    setProgress({ completed: 0, total: liked.length });
    try {
      const result = await prepareLikedImagesDownload([...liked], controller.signal, (completed, total) => setProgress({ completed, total }));
      const url = URL.createObjectURL(result.blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "loved-wedding-photos.zip";
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      setDownloadMessage(result.failed.length ? `Downloaded ${result.downloaded} photos. ${result.failed.length} could not be downloaded; please try again.` : `Downloaded ${result.downloaded} ${result.downloaded === 1 ? "photo" : "photos"} in one ZIP, grouped by ceremony.`);
    } catch (error) {
      setDownloadMessage(controller.signal.aborted ? "Download cancelled." : error instanceof Error ? error.message : "Could not download your photos. Please try again.");
    } finally {
      downloadController.current = null;
      setDownloading(false);
    }
  }

  const undoable = pendingRemovals.filter(item => !liked.some(photo => photo.id === item.image.id));

  return (
    <section className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <div className="relative min-h-72 overflow-hidden rounded-xl border border-rose-900/10 bg-rose-100 shadow-[0_18px_45px_rgba(102,35,49,0.14)] lg:min-h-88">
          <Image src={collection[0]?.thumbSources[0] ?? "/wedding.JPG"} alt="A favourite moment from your wedding memories" fill unoptimized sizes="(max-width: 1024px) 90vw, 55vw" className="object-cover object-center" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(55,18,28,0.04),rgba(55,18,28,0.78))]" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-rose-100/90">Close to your heart</p>
            <h2 className="mt-3 font-serif text-4xl font-bold">Loved Images</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-rose-50/90">The smiles, the celebrations, the little moments you never want to forget.</p>
          </div>
        </div>
        <div className="rounded-xl border border-rose-900/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.92),rgba(248,231,220,0.82))] p-6 shadow-[0_18px_45px_rgba(102,35,49,0.12)]">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-800/75">Your personal collection</p>
          <h3 className="mt-4 font-serif text-3xl font-bold text-rose-950">Your favourites, all together.</h3>
          <p className="mt-4 text-sm leading-7 text-rose-900/75">Every photo here is a moment you love. Explore them by ceremony, relive them in one slideshow, or take the whole collection with you.</p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm text-rose-900">
            <span className="inline-flex items-center gap-2 rounded-full border border-rose-900/10 bg-white/70 px-4 py-2"><HeartIcon className="h-4 w-4" filled />{liked.length} loved {liked.length === 1 ? "photo" : "photos"}</span>
            <span className="rounded-full border border-rose-900/10 bg-white/70 px-4 py-2">{ceremonyCount} {ceremonyCount === 1 ? "ceremony" : "ceremonies"}</span>
          </div>
          {(liked.length > 0 || downloading) && <div className="mt-6 flex items-center gap-3">
            <button type="button" onClick={downloadAll} disabled={downloading} className="rounded-full bg-rose-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-900 disabled:cursor-wait disabled:opacity-60">{downloading ? `Preparing ${progress.completed}/${progress.total}...` : `Download all (${liked.length})`}</button>
            {downloading && <button type="button" className="text-sm font-semibold text-rose-900 underline underline-offset-4" onClick={() => downloadController.current?.abort()}>Cancel</button>}
          </div>}
        </div>
      </div>
      {downloadMessage && <p role="status" className="rounded-xl border border-rose-900/10 bg-white/60 p-3 text-sm text-rose-900">{downloadMessage}</p>}
      {images.length ? <DriveGallery images={images} title="Loved Images" onViewerOpenChange={onViewerOpenChange} onImageUnliked={onImageUnliked} getGroupLabel={image => getLikedImageGroup("title" in image && typeof image.title === "string" ? image.title : "Other memories")} /> : <div className="rounded-3xl border border-dashed border-rose-300 bg-white/60 p-8 text-center text-rose-900"><p>No loved images yet.</p><Link href="/dashboard/album" className="mt-4 inline-block font-semibold underline underline-offset-4">Find moments to love</Link></div>}
      {(undoable.length > 0 || undoError) && <div className="fixed inset-x-4 bottom-5 z-[150] max-h-[40dvh] space-y-2 overflow-y-auto sm:left-auto sm:right-6 sm:w-96">
        {undoable.map(removal => <div key={`${removal.image.id}-${removal.expiresAt}`} role="status" className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-white p-4 text-rose-950 shadow-[0_12px_40px_rgba(70,20,35,0.25)]">
          <HeartIcon className="h-5 w-5 shrink-0 text-rose-800" />
          <div className="min-w-0 flex-1"><p className="text-sm font-semibold">Photo removed</p><p className="mt-1 truncate text-xs text-rose-900/65">{getLikedImageGroup(removal.image.title)} · Undo within 5 seconds</p></div>
          <button type="button" onClick={() => undoRemoval(removal)} aria-label={`Undo removal of ${removal.image.title} photo`} className="rounded-full bg-rose-800 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-900">Undo</button>
        </div>)}
        {undoError && <p role="alert" className="rounded-xl bg-white p-3 text-sm text-rose-900 shadow-lg">{undoError}</p>}
      </div>}
    </section>
  );
}
