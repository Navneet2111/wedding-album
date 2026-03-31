import "server-only";

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { albumItems } from "@/app/dashboard/album/album-data";
import type {
  FaceSearchDescriptorEntry,
  FaceSearchDescriptorIndexFile,
  SearchableDriveImage,
} from "@/lib/face-search-types";
import { getDriveImages } from "@/lib/google-drive";

type FaceSearchSource = {
  albumSlug: string;
  albumTitle: string;
  shortLabel: string;
  folderId: string;
  sourceIndex: number;
};

function getFaceSearchSources(): FaceSearchSource[] {
  return albumItems.flatMap((album) => {
    const folderIds =
      album.driveFolderIds ??
      (album.driveFolderId ? [album.driveFolderId] : []);

    return folderIds.map((folderId, index) => ({
      albumSlug: album.slug,
      albumTitle: album.title,
      shortLabel: album.shortLabel,
      folderId,
      sourceIndex: index,
    }));
  });
}

async function getFaceSearchImagesForSource(
  source: FaceSearchSource,
): Promise<SearchableDriveImage[]> {
  const images = await getDriveImages(source.folderId);
  const sourceLabel =
    source.sourceIndex > 0
      ? `${source.shortLabel} ${source.sourceIndex + 1}`
      : source.shortLabel;

  return images.map((image, index) => ({
    id: image.id,
    albumSlug: source.albumSlug,
    albumTitle: source.albumTitle,
    imageLabel: `${sourceLabel} ${index + 1}`,
  }));
}

export async function getFaceSearchImages() {
  const imageGroups = await Promise.all(
    getFaceSearchSources().map((source) => getFaceSearchImagesForSource(source)),
  );
  const mergedImages = new Map<string, SearchableDriveImage>();

  for (const group of imageGroups) {
    for (const image of group) {
      if (!mergedImages.has(image.id)) {
        mergedImages.set(image.id, image);
      }
    }
  }

  return [...mergedImages.values()];
}

function isDescriptorIndexFile(
  value: unknown,
): value is FaceSearchDescriptorIndexFile {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<FaceSearchDescriptorIndexFile>;
  return (
    candidate.version === 1 &&
    typeof candidate.albumSlug === "string" &&
    Array.isArray(candidate.items)
  );
}

export async function getFaceSearchDescriptorEntries() {
  const dataDirectory = path.join(process.cwd(), "data");

  try {
    const files = await readdir(dataDirectory);
    const indexFiles = files.filter((file) => /^face-index-.*\.json$/i.test(file));
    const fileContents = await Promise.all(
      indexFiles.map(async (file) => {
        const raw = await readFile(path.join(dataDirectory, file), "utf8");
        return JSON.parse(raw) as unknown;
      }),
    );
    const mergedEntries = new Map<string, FaceSearchDescriptorEntry>();

    for (const content of fileContents) {
      if (!isDescriptorIndexFile(content)) {
        continue;
      }

      for (const entry of content.items) {
        if (!mergedEntries.has(entry.id)) {
          mergedEntries.set(entry.id, entry);
        }
      }
    }

    return [...mergedEntries.values()];
  } catch {
    return [];
  }
}
