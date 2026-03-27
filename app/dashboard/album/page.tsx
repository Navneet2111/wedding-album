import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Album",
  description:
    "Private wedding album collections for Anandi and Vineet.",
};

const albumItems = [
  {
    title: "Engagement Stories",
    note: "Warm colors, laughter, and playful rituals.",
    image: "/engagement.jpg",
  },
  {
    title: "Haldi Moments",
    note: "Hand art, music, and close family moments.",
    image: "/haldi.jpg",
  },
  {
    title: "Tilak Ceremony",
    note: "Sacred rituals, vows, and timeless portraits.",
    image: "/tilak.jpg",
  },
  {
    title: "Wedding Ceremony",
    note: "Stage highlights and celebration with guests.",
    image: "/wedding.jpg",
  },
];

export default function AlbumPage() {
  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {albumItems.map((item) => (
          <article
            key={item.title}
            className="rounded-md border border-rose-900/10 bg-[linear-gradient(140deg,rgba(255,255,255,0.88),rgba(251,230,219,0.8))] p-5 shadow-[0_10px_24px_rgba(102,35,49,0.1)]"
          >
            {/* IMAGE */}
            <div className="relative mb-4 h-44 w-full overflow-hidden rounded-[18px]">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-center rounded-[18px]"
              />
            </div>

            <h3 className="text-xl font-semibold text-rose-950">
              {item.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-rose-900/75">
              {item.note}
            </p>
          </article>
        ))}
      </div>

      <Link
        href="/dashboard"
        className="inline-block rounded-full bg-rose-800 px-5 py-3 text-sm font-bold text-rose-50 transition hover:bg-rose-900"
      >
        Back
      </Link>
    </section>
  );
}