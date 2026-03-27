
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Video",
  description:
    "Private wedding video library for Anandi and Vineet.",
};

const videoItems = [
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


      <div className="grid lg:grid-cols-2 gap-4">
        {videoItems.map((item) => (
          <article
            key={item.title}
            className="grid gap-4 rounded-md border border-rose-900/10 bg-[linear-gradient(140deg,rgba(255,255,255,0.88),rgba(251,230,219,0.8))] p-5 shadow-[0_10px_24px_rgba(102,35,49,0.1)] md:grid-cols-[220px_1fr]"
          >
            <div className="grid h-40 place-items-center rounded-[18px] bg-[linear-gradient(135deg,#dd9f85,#efc0a8,#f8e5d6)] text-sm font-bold tracking-[0.25em] text-white">
              PLAY
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-xl font-semibold text-rose-950">
                  {item.title}
                </h3>
                <span className="rounded-full bg-white/75 px-3 py-1 text-xs font-semibold text-rose-900">
                  {item.length}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-rose-900/75">
                {item.note}
              </p>
            </div>
          </article>
        ))}
      </div>


    </section>
  );
}
