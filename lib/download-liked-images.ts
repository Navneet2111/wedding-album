import type { LikedImage } from "@/lib/liked-images";

export const LOVED_IMAGES_FOLDER = "V&A-Weeding_Images";
export type IndividualPhotoDownload = { id: string; name: string; url: string };

function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9_-]+/g, "-").slice(0, 100) || "photo";
}

function isPhoneOrTablet() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function requestDownload(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

/** Desktop receives one flat ZIP; phones and tablets receive individual photos. */
export async function downloadLovedImages(
  images: LikedImage[],
  signal: AbortSignal,
  onProgress: (completed: number, total: number) => void,
) {
  const zipTools = isPhoneOrTablet() ? null : await import("fflate");
  signal.throwIfAborted();
  const chunks: ArrayBuffer[] = [];
  let archiveError: Error | null = null;
  const zip = zipTools ? new zipTools.Zip((error, chunk) => {
    if (error) archiveError = error;
    else chunks.push(new Uint8Array(chunk).buffer);
  }) : null;
  const failed: string[] = [];
  const individualDownloads: IndividualPhotoDownload[] = [];
  let completed = 0;
  let downloaded = 0;
  try {
    for (const [index, photo] of images.entries()) {
      signal.throwIfAborted();
      const url = `/api/drive/image/${encodeURIComponent(photo.id)}?size=2000`;
      try {
        const response = await fetch(url, { signal });
        const contentType = response.headers.get("content-type")?.split(";")[0].trim();
        if (!response.ok || !contentType?.startsWith("image/")) throw new Error("Photo unavailable");
        const blob = await response.blob();
        if (!blob.size) throw new Error("Empty photo");
        const extension = ({ "image/png": "png", "image/webp": "webp", "image/gif": "gif", "image/avif": "avif" } as Record<string, string>)[contentType] ?? "jpg";
        const name = `${String(index + 1).padStart(3, "0")}-${safeName(photo.id)}.${extension}`;
        signal.throwIfAborted();
        if (zip && zipTools) {
          const bytes = new Uint8Array(await blob.arrayBuffer());
          signal.throwIfAborted();
          const entry = new zipTools.ZipPassThrough(name);
          zip.add(entry);
          entry.push(bytes, true);
        } else {
          requestDownload(blob, name);
          individualDownloads.push({ id: photo.id, name, url });
        }
        downloaded++;
      } catch (error) {
        if (signal.aborted) throw error;
        failed.push(photo.id);
      }
      if (archiveError) throw archiveError;
      onProgress(++completed, images.length);
    }
    signal.throwIfAborted();
    if (!downloaded) throw new Error("The photos could not be downloaded. Please try again.");
    if (zip) {
      zip.end();
      if (archiveError) throw archiveError;
      signal.throwIfAborted();
      requestDownload(new Blob(chunks, { type: "application/zip" }), `${LOVED_IMAGES_FOLDER}.zip`);
    }
    return { mode: zip ? "zip" as const : "individual" as const, downloaded, failed, individualDownloads };
  } catch (error) {
    zip?.terminate();
    throw error;
  }
}
