"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getAlbumItem } from "@/app/dashboard/album/album-data";
import DashboardActionButton from "@/components/dashboard-action-button";
import DashboardHeader from "@/components/dashboard-header";
import ArrowUpIcon from "@/components/icons/arrow-up-icon";
import SpiralInvitationFrame from "@/components/spral-invitation-frame";

type DashboardShellProps = {
  children: ReactNode;
};

export default function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const isAlbumDetail = pathname.startsWith("/dashboard/album/");
  const slug = isAlbumDetail ? (pathname.split("/").pop() ?? "") : "";
  const detailItem = getAlbumItem(slug);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  useEffect(() => {
    const scrollContainer = document.querySelector<HTMLElement>(
      "[data-dashboard-scroll-container='true']",
    );

    scrollContainer?.scrollTo({ top: 0, behavior: "instant" });
    window.scrollTo({ top: 0, behavior: "instant" });
    document.documentElement.scrollTo({ top: 0, behavior: "instant" });
    document.body.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  useEffect(() => {
    const desktopContainer = document.querySelector<HTMLElement>(
      "[data-dashboard-scroll-container='true']"
    );

    function updateVisibility() {
      const desktopScrollTop = desktopContainer?.scrollTop ?? 0;
      const mobileScrollTop = window.scrollY;
      setShowScrollToTop(desktopScrollTop > 140 || mobileScrollTop > 140);
    }

    updateVisibility();

    desktopContainer?.addEventListener("scroll", updateVisibility, {
      passive: true,
    });
    window.addEventListener("scroll", updateVisibility, { passive: true });
    window.addEventListener("resize", updateVisibility);

    return () => {
      desktopContainer?.removeEventListener("scroll", updateVisibility);
      window.removeEventListener("scroll", updateVisibility);
      window.removeEventListener("resize", updateVisibility);
    };
  }, [pathname]);

  function getActiveScrollContainer() {
    const scrollContainer = document.querySelector<HTMLElement>(
      "[data-dashboard-scroll-container='true']"
    );

    if (
      scrollContainer &&
      window.matchMedia("(min-width: 768px)").matches &&
      scrollContainer.offsetParent !== null
    ) {
      return scrollContainer;
    }

    return null;
  }

  function handleScrollToTop() {
    const scrollContainer = getActiveScrollContainer();

    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
    document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
    document.body.scrollTo({ top: 0, behavior: "smooth" });
  }

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

      <div className="relative px-4 py-6 md:hidden">
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

      {showScrollToTop ? (
        <button
          type="button"
          onClick={handleScrollToTop}
          aria-label="Scroll to top"
          className="fixed bottom-0 right-0 z-50 grid h-14 w-14 cursor-pointer place-items-center rounded-tl-[18px] bg-rose-900 text-rose-50 shadow-[0_12px_26px_rgba(70,20,35,0.28)] transition hover:bg-rose-950"
        >
          <ArrowUpIcon className="h-6 w-6" />
        </button>
      ) : null}
    </>
  );
}
