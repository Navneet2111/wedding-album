import type { Metadata } from "next";
import Link from "next/link";
import AlbumGrid from "@/components/album-grid";

export const metadata: Metadata = {
  title: "Album",
  description:
    "Private wedding album collections for Anandi and Vineet.",
};

export default function AlbumPage() {
  return (
    <section className="space-y-6">
      <AlbumGrid />

      <Link
        href="/dashboard"
        className="inline-block rounded-full bg-rose-800 px-5 py-3 text-sm font-bold text-rose-50 transition hover:bg-rose-900"
      >
        Back
      </Link>
    </section>
  );
}
