import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Overview page for the private Anandi and Vineet wedding dashboard.",
};

export default function DashboardPage() {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-5 rounded-[28px] bg-white/70 p-6 shadow-[0_12px_28px_rgba(102,35,49,0.1)]">
        <h2 className="font-serif text-4xl font-bold text-rose-950 md:text-5xl">
          Welcome to our private wedding space
        </h2>
        <p className="max-w-2xl text-base leading-7 text-rose-900/80">
          Use this dashboard to browse your wedding memories.
          I&apos;ve added separate pages for your album and your video gallery.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/album"
            className="rounded-full bg-rose-800 px-5 py-3 text-sm font-bold text-rose-50 transition hover:bg-rose-900"
          >
            Open Album
          </Link>
          <Link
            href="/dashboard/video"
            className="rounded-full border border-rose-800/20 px-5 py-3 text-sm font-bold text-rose-900 transition hover:border-rose-800/35 hover:bg-white/60"
          >
            Open Video
          </Link>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="rounded-3xl bg-white/80 p-5 shadow-[0_12px_28px_rgba(102,35,49,0.12)]">
          <p className="text-sm font-semibold text-rose-900">Album Page</p>
          <p className="mt-2 text-sm leading-6 text-rose-900/75">
            our ceremony photos, candid moments, couple portraits, and family
            shots.
          </p>
          <Link
            href="/dashboard/album"
            className="mt-4 inline-block text-sm font-semibold text-rose-800"
          >
            Go to album
          </Link>
        </div>
        <div className="rounded-3xl bg-[linear-gradient(135deg,#f9e3d3,#f7cdbf)] p-5 shadow-[0_12px_28px_rgba(102,35,49,0.12)]">
          <p className="text-sm font-semibold text-rose-900">Video Page</p>
          <p className="mt-2 text-sm leading-6 text-rose-900/75">
            our highlight reels, wedding teaser clips, and full ceremony
            videos.
          </p>
          <Link
            href="/dashboard/video"
            className="mt-4 inline-block text-sm font-semibold text-rose-800"
          >
            Go to video
          </Link>
        </div>
      </div>
    </section>
  );
}
