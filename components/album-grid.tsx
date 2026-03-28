"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { albumItems } from "@/app/dashboard/album/album-data";

export default function AlbumGrid() {
  const router = useRouter();
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function handleOpen(slug: string) {
    if (activeSlug) {
      return;
    }

    setActiveSlug(slug);

    window.setTimeout(() => {
      startTransition(() => {
        router.push(`/dashboard/album/${slug}`);
      });
    }, 30);
  }

  return (
    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
      {albumItems.map((item) => {
        const isActive = activeSlug === item.slug;
        const isDimmed = activeSlug !== null && !isActive;

        return (
          <button
            key={item.slug}
            type="button"
            onClick={() => handleOpen(item.slug)}
            disabled={activeSlug !== null}
            className={`group relative cursor-pointer rounded-[28px] border-rose-900/10 bg-transparent text-left transition duration-500 [perspective:1600px] disabled:cursor-default ${
              isDimmed ? "opacity-35c " : "opacity-100"
            }`}
          >
            <div
              className={`relative block min-h-full rounded-[28px] bg-[linear-gradient(140deg,rgba(255,255,255,0.94),rgba(251,230,219,0.82))] p-5 shadow-[0_10px_24px_rgba(102,35,49,0.1)] transition duration-700 [transform-style:preserve-3d] ${
                isActive
                  ? "scale-[1.02] shadow-[0_24px_60px_rgba(102,35,49,0.22)]"
                  : "group-hover:-translate-y-1"
              }`}
              style={{
                transform: isActive
                  ? "rotateY(-85deg)"
                  : "rotateY(0deg)",
                transformOrigin: "left center",
              }}
            >
              {/* Front face */}
              <div
                className="relative w-full rounded-[28px] "
                style={{
                  backfaceVisibility: "hidden",
                }}
              >
                <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.55),transparent_35%)]" />
                <div
                  className="pointer-events-none absolute inset-0 "
                  style={{
                    backfaceVisibility: "hidden",
                  }}
                />
                
                <div className="relative">
                  <div className="relative mb-4 block h-44 w-full overflow-hidden rounded-[18px] md:h-60 lg:h-52">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="rounded-[18px] object-cover object-center"
                    />
                  </div>
                  <div className="text-xl font-semibold text-rose-950">
                    {item.title}
                  </div>
                  <div className="mt-2 block text-sm leading-6 text-rose-900/75">
                    {item.note}
                  </div>
                </div>
              </div>

              {/* Back face - shows when card is flipped */}
              <div
                className="absolute inset-0 rounded-[28px] bg-rose-900 p-5"
                style={{
                  transform: "rotateY(180deg)",
                  backfaceVisibility: "hidden",
                }}
              >
                <div className="flex h-full flex-col items-center justify-center rounded-[22px] border border-dashed border-rose-200/30">
            
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
