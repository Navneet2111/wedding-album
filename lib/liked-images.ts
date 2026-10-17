"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { DriveImage } from "@/lib/google-drive";

export type LikedImage = DriveImage & { title: string };
export const LIKED_IMAGES_KEY = "wedding-liked-images-v1";
const CHANGE_EVENT = "wedding-liked-images-change";

function getSnapshot() {
  try { return window.localStorage.getItem(LIKED_IMAGES_KEY) ?? "[]"; }
  catch { return "[]"; }
}

function parseImages(raw: string): LikedImage[] {
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    const seen = new Set<string>();
    return value.filter((item): item is LikedImage => {
      if (!item || typeof item.id !== "string" || typeof item.title !== "string" ||
          !Array.isArray(item.fullSources) || !Array.isArray(item.thumbSources) ||
          ![...item.fullSources, ...item.thumbSources].every(src => typeof src === "string") ||
          !item.fullSources.length || !item.thumbSources.length || seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  } catch { return []; }
}

function subscribe(callback: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === LIKED_IMAGES_KEY || event.key === null) callback();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

/** Photos stay on this browser; store URLs and metadata rather than image data. */
export function toggleLikedImage(image: DriveImage, title: string): boolean {
  const current = parseImages(getSnapshot());
  const next = current.some(item => item.id === image.id)
    ? current.filter(item => item.id !== image.id)
    : [...current, { ...image, title }];
  try {
    window.localStorage.setItem(LIKED_IMAGES_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(CHANGE_EVENT));
    return true;
  } catch { return false; }
}

/** Undo adds a photo back without toggling off a copy restored in another tab. */
export function restoreLikedImage(image: LikedImage, index: number): boolean {
  const current = parseImages(getSnapshot());
  if (current.some(item => item.id === image.id)) return true;
  current.splice(Math.max(0, Math.min(index, current.length)), 0, image);
  try {
    window.localStorage.setItem(LIKED_IMAGES_KEY, JSON.stringify(current));
    window.dispatchEvent(new Event(CHANGE_EVENT));
    return true;
  } catch { return false; }
}

export function useLikedImages() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, () => "[]");
  return useMemo(() => parseImages(raw), [raw]);
}
