import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Album",
  description:
    "Private wedding album collections for Anandi and Vineet.",
};

const albumItems = [
  { title: "Haldi Moments", note: "Warm colors, laughter, and playful rituals." },
  { title: "Mehndi Stories", note: "Hand art, music, and close family moments." },
  { title: "Wedding Ceremony", note: "Sacred rituals, vows, and timeless portraits." },
  { title: "Reception Night", note: "Stage highlights and celebration with guests." },
];

export default function AlbumPage() {
  return (
    <section className="space-y-6">
      {/* <div className="rounded-[28px] bg-white/75 p-6 shadow-[0_12px_28px_rgba(102,35,49,0.1)]">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-800/80">
          Album
        </p>
        <h2 className="mt-3 font-serif text-4xl font-bold text-rose-950">
          Wedding Photo Collections
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-7 text-rose-900/80">
          This page is ready for your wedding albums. Replace these cards with
          real image galleries or links to your stored photos.
        </p>
      </div> */}

      <div className="grid gap-4 md:grid-cols-2">
        {albumItems.map((item) => (
          <article
            key={item.title}
            className="rounded-md border border-rose-900/10 bg-[linear-gradient(140deg,rgba(255,255,255,0.88),rgba(251,230,219,0.8))] p-5 shadow-[0_10px_24px_rgba(102,35,49,0.1)]"
          >
            <div className="mb-4 h-44 rounded-[18px] bg-[linear-gradient(135deg,#f4d3c3,#f8e9df,#efc2b1)]" />
            <h3 className="text-xl font-semibold text-rose-950">{item.title}</h3>
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
        Back to dashboard
      </Link>
    </section>
  );
}
