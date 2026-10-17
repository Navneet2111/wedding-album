import type { LikedImage } from "@/lib/liked-images";
import { groupLikedImages } from "@/lib/liked-image-groups";

function safeName(name: string) {
  return name.normalize("NFKD").replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "photos";
}

/** One ZIP, with one folder per ceremony. Photos are already compressed. */
export async function prepareLikedImagesDownload(
  images: LikedImage[],
  signal: AbortSignal,
  onProgress: (completed: number, total: number) => void,
) {
  const { Zip, ZipPassThrough } = await import("fflate");
  const chunks: ArrayBuffer[] = [];
  let archiveError: Error | null = null;
  const zip = new Zip((error, chunk) => {
    if (error) archiveError = error;
    else chunks.push(new Uint8Array(chunk).buffer);
  });
  let completed = 0;
  let downloaded = 0;
  const failed: string[] = [];
  try {
    for (const [group, photos] of groupLikedImages(images)) {
      for (const [index, photo] of photos.entries()) {
        signal.throwIfAborted();
        try {
          const response = await fetch(`/api/drive/image/${encodeURIComponent(photo.id)}?size=2000`, { signal });
          const contentType = response.headers.get("content-type")?.split(";")[0].trim();
          if (!response.ok || !contentType?.startsWith("image/")) throw new Error("Photo unavailable");
          const bytes = new Uint8Array(await response.arrayBuffer());
          if (!bytes.length) throw new Error("Empty photo");
          const extension = ({ "image/png": "png", "image/webp": "webp", "image/gif": "gif", "image/avif": "avif" } as Record<string, string>)[contentType] ?? "jpg";
          const entry = new ZipPassThrough(`${safeName(group)}/${String(index + 1).padStart(3, "0")}-${safeName(photo.id)}.${extension}`);
          zip.add(entry);
          entry.push(bytes, true);
          downloaded++;
        } catch (error) {
          if (signal.aborted) throw error;
          failed.push(photo.id);
        }
        if (archiveError) throw archiveError;
        onProgress(++completed, images.length);
      }
    }
    signal.throwIfAborted();
    if (!downloaded) throw new Error("The photos could not be downloaded. Please try again.");
    zip.end();
    if (archiveError) throw archiveError;
    return { blob: new Blob(chunks, { type: "application/zip" }), downloaded, failed };
  } catch (error) {
    zip.terminate();
    throw error;
  }
}
