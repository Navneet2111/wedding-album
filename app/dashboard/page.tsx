import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import FaceSearchPanelServer from "@/components/face-search-panel-server";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Overview page for the private Anandi and Vineet wedding dashboard.",
};

function FaceSearchPanelFallback() {
  return (
    <section className="rounded-xl border border-rose-800/40 bg-[linear-gradient(145deg,rgba(255,255,255,0.94),rgba(248,231,220,0.9))] px-3 py-6 shadow-[0_16px_36px_rgba(102,35,49,0.12)] md:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-base font-bold uppercase tracking-[0.2em] text-rose-800 md:text-sm md:font-semibold md:tracking-[0.28em] md:text-rose-800/80">
            Face Search
          </p>
          <h2 className="mt-3 font-serif text-lg font-bold text-rose-950 md:text-3xl">
            Loading search Feature ...
          </h2>
          <p className="mt-3 hidden text-sm leading-7 text-rose-900/75 md:block">
            The search scans the uploaded face against all wedding photos available and returns the closest matches.
          </p>
        </div>
        <div className="w-full max-w-xl rounded-3xl border border-rose-900/30 bg-white/75 p-4 shadow-[0_12px_30px_rgba(102,35,49,0.08)]">
          <div className="space-y-4">
            <div className="h-5 w-40 animate-pulse rounded-full bg-rose-100" />
            <div className="h-12 w-full animate-pulse rounded-2xl bg-rose-100" />
            <div className="h-28 w-28 animate-pulse rounded-2xl bg-rose-100" />
            <div className="flex gap-2">
              <div className="h-10 w-24 animate-pulse rounded-full bg-rose-100" />
              <div className="h-10 w-24 animate-pulse rounded-full bg-rose-100" />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8 rounded-3xl border border-dashed border-rose-300 bg-white/60 px-5 py-8 text-sm text-rose-900/70">
        Loading search Feature ...
      </div>
    </section>
  );
}

export default function DashboardPage() {
  return (
    <section className="grid gap-6 rounded-[28px] md:bg-white/70  md:p-6 md:shadow-[0_12px_28px_rgba(102,35,49,0.1)]">
      <div className="space-y-5 rounded-xl bg-white/70 px-3 py-6 md:p-6 shadow-[0_12px_28px_rgba(102,35,49,0.1)] border border-rose-900/80">
        <h2 className="font-serif text-xl md:text-4xl font-bold text-rose-950 lg:text-5xl">
          Welcome to our private wedding space
        </h2>
        <p className="max-w-2xl text-sm md:text-base leading-7 text-rose-900/80">
          Use this dashboard to browse your wedding memories. I&apos;ve added
          separate pages for your album and your video gallery.
        </p>
        <div className="flex flex-wrap gap-2 md:gap-3">
          <Link
            href="/dashboard/album"
            className="rounded-full bg-rose-800 px-4 md:px-5 py-3 text-sm font-bold text-rose-50 transition hover:bg-rose-900"
          >
            Open Album
          </Link>
          <Link
            href="/dashboard/video"
            className="rounded-full border border-rose-800/50 px-4 md:px-5 py-3 text-sm font-bold text-rose-900 transition hover:border-rose-800/35 hover:bg-white/60"
          >
            Open Video
          </Link>
        </div>
      </div>
      <Suspense fallback={<FaceSearchPanelFallback />}>
        <FaceSearchPanelServer />
      </Suspense>
    </section>
  );
}
