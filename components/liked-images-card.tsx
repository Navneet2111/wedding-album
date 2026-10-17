"use client";

import Image from "next/image";
import Link from "next/link";
import HeartIcon from "@/components/icons/heart-icon";
import { useLikedImages } from "@/lib/liked-images";

export default function LikedImagesCard({ compact = false }: { compact?: boolean }) {
  const liked = useLikedImages();
  if (!liked.length) return null;
  if (compact) return <Link href="/dashboard/album/liked" className="inline-flex items-center gap-2 rounded-full border border-rose-800/50 px-4 py-3 text-sm font-bold text-rose-900 transition hover:bg-white/60"><HeartIcon className="h-4 w-4" filled />Loved Images ({liked.length})</Link>;
  return (
    <Link href="/dashboard/album/liked" className="group relative rounded-[28px] bg-[linear-gradient(140deg,rgba(255,255,255,0.94),rgba(251,230,219,0.82))] p-5 text-left shadow-[0_10px_24px_rgba(102,35,49,0.1)] transition hover:-translate-y-1">
      <div className="relative mb-4 h-44 overflow-hidden rounded-[18px] md:h-60 lg:h-52">
        <Image src={liked[0].thumbSources[0]} alt="Your loved photos" fill unoptimized sizes="(max-width: 1024px) 90vw, 30vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" />
        <span className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-full bg-rose-800 text-white"><HeartIcon className="h-5 w-5" filled /></span>
      </div>
      <h2 className="text-xl font-semibold text-rose-950">Loved Images</h2>
      <p className="mt-2 text-sm leading-6 text-rose-900/75">{liked.length} {liked.length === 1 ? "photo" : "photos"} you love, saved on this device.</p>
    </Link>
  );
}
