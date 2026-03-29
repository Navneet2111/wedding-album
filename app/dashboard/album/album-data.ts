export type AlbumItem = {
  slug: "engagement" | "haldi" | "tilak" | "wedding";
  title: string;
  shortLabel: string;
  note: string;
  image: string;
  description: string;
  highlights: string[];
  driveFolderId?: string;
  driveFolderIds?: string[];
};

export const albumItems: AlbumItem[] = [
  {
    slug: "engagement",
    title: "Engagement Stories",
    shortLabel: "Engagement",
    note: "Warm colors, laughter, and playful rituals.",
    image: "/engagement.JPG",
    description:
      "A soft opening chapter with family smiles, ring moments, and portraits full of warmth.",
    highlights: [
      "Ring exchange and couple portraits",
      "Family blessings and candid smiles",
      "Stage moments with warm lighting",
    ],
    driveFolderId: "1ILfKxgKY8fepQKUqghjdpQRTgcNw1Pr_",
    driveFolderIds: [
      "1ILfKxgKY8fepQKUqghjdpQRTgcNw1Pr_",
      "1vWkQPAweGZ7rYTqWYBMjEFKgZk1csjOc",
    ],
  },
  {
    slug: "haldi",
    title: "Haldi Moments",
    shortLabel: "Haldi",
    note: "Hand art, music, and close family moments.",
    image: "/haldi.JPG",
    description:
      "Joyful haldi scenes with color, laughter, and those close family celebrations that make the day feel alive.",
    highlights: [
      "Turmeric rituals and floral details",
      "Playful candid moments",
      "Music, laughter, and family energy",
    ],
    driveFolderId: "1q7BwqXx7339H-w71UCBLMHHF5UsOarlT",
    driveFolderIds: ["1q7BwqXx7339H-w71UCBLMHHF5UsOarlT"],
  },
  {
    slug: "tilak",
    title: "Tilak Ceremony",
    shortLabel: "Tilak",
    note: "Sacred rituals, vows, and timeless portraits.",
    image: "/tilak.JPG",
    description:
      "A ceremonial chapter focused on blessings, tradition, and composed portraits around the tilak rituals.",
    highlights: [
      "Traditional ritual frames",
      "Blessings and formal portraits",
      "Close-up details from the ceremony",
    ],
    driveFolderId: "16NUVaQPYTFjgWNmWn_LV_CaTPYAai-vX",
    driveFolderIds: ["16NUVaQPYTFjgWNmWn_LV_CaTPYAai-vX"],
  },
  {
    slug: "wedding",
    title: "Wedding Ceremony",
    shortLabel: "Wedding",
    note: "Stage highlights and celebration with guests.",
    image: "/wedding.JPG",
    description:
      "The main wedding chapter with grand stage scenes, rituals, couple portraits, and celebration around every frame.",
    highlights: [
      "Mandap and ritual highlights",
      "Couple portraits and stage moments",
      "Guest celebrations and festive details",
    ],
    driveFolderId: "1hJZaWEDKIHEHEAzzjCPCmDkvDwz547Qd",
    driveFolderIds: ["1hJZaWEDKIHEHEAzzjCPCmDkvDwz547Qd"],
  },
];

export function getAlbumItem(slug: string) {
  return albumItems.find((item) => item.slug === slug);
}
