import type { LikedImage } from "@/lib/liked-images";

export function getLikedImageGroup(title: string) {
  const normalized = title.toLowerCase();
  if (/haldi/.test(normalized)) return "Haldi";
  if (/mehndi|mehendi|mehandi|mehandhi|henna/.test(normalized)) return "Mehndi";
  if (/engagement/.test(normalized)) return "Engagement";
  if (/tilak/.test(normalized)) return "Tilak";
  if (/wedding/.test(normalized)) return "Wedding";
  return title.trim() || "Other memories";
}

export function groupLikedImages(images: LikedImage[]) {
  const groups = new Map<string, LikedImage[]>();
  for (const image of images) {
    const name = getLikedImageGroup(image.title);
    const group = groups.get(name) ?? [];
    group.push(image);
    groups.set(name, group);
  }
  return [...groups].sort(([a], [b]) => a.localeCompare(b));
}
