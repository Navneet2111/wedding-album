import "server-only";

import type { AlbumItem } from "@/app/dashboard/album/album-data";

const albumDriveFolderEnvBySlug: Record<AlbumItem["slug"], string> = {
  engagement: "ALBUM_DRIVE_FOLDERS_ENGAGEMENT",
  haldi: "ALBUM_DRIVE_FOLDERS_HALDI",
  tilak: "ALBUM_DRIVE_FOLDERS_TILAK",
  wedding: "ALBUM_DRIVE_FOLDERS_WEDDING",
};

export function getAlbumDriveFolderIds(slug: AlbumItem["slug"]) {
  const envValue = process.env[albumDriveFolderEnvBySlug[slug]];

  if (!envValue) {
    return [];
  }

  return envValue
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

export function getAlbumPrimaryDriveFolderId(slug: AlbumItem["slug"]) {
  return getAlbumDriveFolderIds(slug)[0];
}
