"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { getAlbumItem } from "@/app/dashboard/album/album-data";
import DashboardActionButton from "@/components/dashboard-action-button";
import DashboardHeader from "@/components/dashboard-header";
import SpiralInvitationFrame from "@/components/spral-invitation-frame";

type DashboardShellProps = {
  children: ReactNode;
};

export default function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const isAlbumDetail = pathname.startsWith("/dashboard/album/");
  const slug = isAlbumDetail ? (pathname.split("/").pop() ?? "") : "";
  const detailItem = getAlbumItem(slug);

  return (
    <>
      <div className="hidden md:block">
        <SpiralInvitationFrame>
          <div className="mx-auto min-h-dvh w-full max-w-8xl px-0 md:px-0 lg:py-2">
            <div className="rounded-md border border-rose-900/15 bg-[linear-gradient(145deg,rgba(255,251,247,0.96),rgba(250,232,220,0.92))] p-5 shadow-[0_24px_60px_rgba(102,35,49,0.18)] md:p-8">
              <div className="mb-4 flex flex-col gap-2 border-b border-rose-900/10 pb-3 md:flex-row md:items-center md:justify-between">
                {isAlbumDetail ? (
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.28em] text-rose-800/80">
                      Album
                    </p>
                    <h1 className="mt-2 font-serif text-2xl font-bold text-rose-950 lg:text-3xl">
                      {detailItem?.title ?? "Album"}
                    </h1>
                  </div>
                ) : (
                  <DashboardHeader />
                )}
                <div className="flex flex-wrap gap-3 md:justify-end">
                  <DashboardActionButton />
                </div>
              </div>

              {children}
            </div>
          </div>
        </SpiralInvitationFrame>
      </div>

      <div className="px-4 py-6 md:hidden">
        <div className="rounded-md border border-rose-900/15 bg-[linear-gradient(145deg,rgba(255,251,247,0.96),rgba(250,232,220,0.92))] p-5 shadow-[0_24px_60px_rgba(102,35,49,0.18)]">
          <div className="mb-6 flex flex-col gap-4 border-b border-rose-900/10 pb-5">
            {isAlbumDetail ? (
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className=" font-serif text-2xl font-bold text-rose-950 capitalize">
                    {detailItem?.slug ?? "Album"}
                  </h1>
                </div>
                <DashboardActionButton />
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-3">
                  <DashboardHeader mobile showNav={false} />
                  <div className="shrink-0">
                    <DashboardActionButton />
                  </div>
                </div>
                <DashboardHeader mobile showHeading={false} />
              </>
            )}
          </div>

          {children}
        </div>
      </div>
    </>
  );
}
