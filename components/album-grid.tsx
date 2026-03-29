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
    if (activeSlug) return;

    setActiveSlug(slug);

    window.setTimeout(() => {
      startTransition(() => {
        router.push(`/dashboard/album/${slug}`);
      });
    }, 20); // wait for book-open animation to finish
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
            className={`group relative cursor-pointer text-left transition-opacity duration-500 disabled:cursor-default ${
              isDimmed ? "opacity-30" : "opacity-100"
            }`}
            style={{ perspective: "1600px" }}
          >
            {/* Book spine / shadow base */}
            <div className="relative rounded-[28px]">

              {/* The cover — rotates open like a book */}
              <div
                className="relative z-10 min-h-full rounded-[28px] bg-[linear-gradient(140deg,rgba(255,255,255,0.94),rgba(251,230,219,0.82))] p-5 shadow-[0_10px_24px_rgba(102,35,49,0.1)]"
                style={{
                  transformStyle: "preserve-3d",
                  transformOrigin: "left center",
                  transition: "transform 0.7s cubic-bezier(0.645, 0.045, 0.355, 1.000), box-shadow 0.7s ease",
                  transform: isActive
                    ? "rotateY(-90deg)"
                    : "rotateY(0deg)",
                  boxShadow: isActive
                    ? "-20px 20px 60px rgba(102,35,49,0.35)"
                    : "0 10px 24px rgba(102,35,49,0.1)",
                }}
              >
                {/* FRONT of cover */}
                <div
                  style={{ backfaceVisibility: "hidden" }}
                  className="relative w-full rounded-[28px]"
                >
                  {/* Shine overlay */}
                  <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.55),transparent_35%)]" />

                  <div className="relative">
                    <div className="relative mb-4 block h-44 w-full overflow-hidden rounded-[18px] md:h-60 lg:h-52">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="rounded-[18px] object-cover object-center transition duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="text-xl font-semibold text-rose-950">
                      {item.title}
                    </div>
                    <div className="mt-2 block text-sm leading-6 text-rose-900/75">
                      {item.note}
                    </div>
                  </div>

                  {/* Spine line on left edge */}
                  {/* <div className="pointer-events-none absolute inset-y-0 left-0 w-[3px] rounded-l-[28px] bg-gradient-to-b from-rose-200/60 via-rose-300/40 to-rose-200/60" /> */}
                </div>

                {/* BACK of cover (inside face) */}
                <div
                  className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-rose-900 to-rose-950 p-5"
                  style={{
                    transform: "rotateY(180deg)",
                    backfaceVisibility: "hidden",
                  }}
                >
                  <div className="flex h-full flex-col items-center justify-center rounded-[22px] border border-dashed border-rose-200/30">
                    <span className="text-rose-200/50 text-sm">Opening…</span>
                  </div>
                </div>
              </div>

              {/* Pages / book body revealed underneath */}
              <div
                className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-rose-50 to-rose-100"
                style={{ zIndex: 0 }}
              >
                <div className="flex h-full flex-col items-center justify-center gap-2 p-6">
                  {/* Simulated page lines */}
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="h-[2px] w-full rounded-full bg-rose-200/60"
                      style={{ width: `${85 - i * 5}%` }}
                    />
                  ))}
                </div>
                {/* Right-edge page stack effect */}
                <div className="absolute inset-y-2 right-0 flex gap-[2px] pr-1">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-full w-[3px] rounded-full bg-rose-200/50"
                    />
                  ))}
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}