import type { Metadata } from "next";
import LikedImagesGallery from "@/components/liked-images-gallery";

export const metadata: Metadata = { title: "Loved Images", description: "Your favourite wedding photos saved on this device." };

export default function LikedImagesPage() {
  return <LikedImagesGallery />;
}
