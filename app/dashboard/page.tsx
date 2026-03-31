import type { Metadata } from "next";
import Link from "next/link";
import FaceSearchPanelServer from "@/components/face-search-panel-server";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Overview page for the private Anandi and Vineet wedding dashboard.",
};

export default async function DashboardPage() {
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
      <FaceSearchPanelServer />
    </section>
  );
}
