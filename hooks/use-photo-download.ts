"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DownloadOutcome } from "@/components/download-progress-dialog";
import { downloadLovedImages, LOVED_IMAGES_FOLDER, type IndividualPhotoDownload } from "@/lib/download-liked-images";
import type { LikedImage } from "@/lib/liked-images";

export function usePhotoDownload() {
  const [downloading, setDownloading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [outcome, setOutcome] = useState<DownloadOutcome>(null);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [message, setMessage] = useState("");
  const [individualDownloads, setIndividualDownloads] = useState<IndividualPhotoDownload[]>([]);
  const controller = useRef<AbortController | null>(null);
  const dialogOpenRef = useRef(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => () => controller.current?.abort(), []);

  const dismiss = useCallback(() => {
    const restoreFocus = dialogOpenRef.current;
    dialogOpenRef.current = false;
    setDialogOpen(false);
    if (restoreFocus) window.requestAnimationFrame(() => triggerRef.current?.focus({ preventScroll: true }));
  }, []);

  // Only finished notifications expire. Active preparation is never timed out.
  useEffect(() => {
    if (downloading || !message) return;
    const timer = window.setTimeout(() => { dismiss(); setMessage(""); }, 7000);
    return () => window.clearTimeout(timer);
  }, [downloading, message, dismiss]);

  const start = useCallback(async (photos: LikedImage[]) => {
    if (controller.current || !photos.length) return;
    const current = new AbortController();
    controller.current = current;
    // Freeze the visible matches, even if a face search is still finding more.
    const snapshot = [...photos];
    setDownloading(true);
    dialogOpenRef.current = true;
    setDialogOpen(true);
    setOutcome(null);
    setMessage("");
    setIndividualDownloads([]);
    setProgress({ completed: 0, total: snapshot.length });
    try {
      const result = await downloadLovedImages(snapshot, current.signal, (completed, total) => setProgress({ completed, total }));
      setIndividualDownloads(result.individualDownloads);
      setOutcome(result.failed.length ? "partial" : "success");
      const summary = result.mode === "zip"
        ? `Downloaded ${result.downloaded} ${result.downloaded === 1 ? "photo" : "photos"} in ${LOVED_IMAGES_FOLDER}.zip. All photos are together, without ceremony subfolders.`
        : `Requested ${result.downloaded} individual photo downloads. Allow multiple downloads if your browser asks. Individual download links are available on this page if needed.`;
      setMessage(summary + (result.failed.length ? ` ${result.failed.length} photos could not be downloaded; please try again.` : ""));
    } catch (error) {
      const cancelled = current.signal.aborted || (error instanceof DOMException && error.name === "AbortError");
      setOutcome(cancelled ? "cancelled" : "error");
      setMessage(cancelled ? "Download cancelled. Photos already downloaded will stay on your device." : error instanceof Error ? error.message : "Could not download your photos. Please try again.");
    } finally {
      controller.current = null;
      setDownloading(false);
    }
  }, []);

  const cancel = useCallback(() => controller.current?.abort(), []);
  return { downloading, dialogOpen, outcome, progress, message, individualDownloads, triggerRef, start, cancel, dismiss };
}
