import type { Metadata } from "next";
import VideoGallery from "@/components/video-gallery";

export const metadata: Metadata = {
  title: "Video",
  description:
    "Private wedding video library for Anandi and Vineet.",
};

const videoItems = [
  {
    title: "Engagement Trailer",
    length: "02:13",
    note: "Short cinematic teaser.",
    embedUrl: "https://www.youtube.com/embed/EEfqFG5XlxE",
  },
  { title: "Wedding Trailer", length: "02:15", note: "Short cinematic teaser." },
  {
    title: "Ceremony Film",
    length: "18:40",
    note: "Full wedding rituals and highlights.",
  },
  {
    title: "Reception Highlights",
    length: "06:20",
    note: "Dancing, speeches, and stage moments.",
  },
];

export default function VideoPage() {
  return (
    <section className="space-y-6">
      <VideoGallery items={videoItems} />
    </section>
  );
}
