import type { Metadata } from "next";
import { ReactNode } from "react";
import { logoutAction } from "@/app/login/actions";
import DashboardHeader from "@/components/dashboard-header";
import InvitationFrame from "@/components/invitation-frame";
import { requireSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Private wedding dashboard for Anandi and Vineet with albums and video collections.",
};

type DashboardLayoutProps = {
  children: ReactNode;
};

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  await requireSession();

  return (
    <>
      {/* ✅ Tablet & Desktop (with InvitationFrame) */}
      <div className="hidden md:block">
        <InvitationFrame>
          <div className="mx-auto min-h-dvh w-full max-w-6xl px-6 py-24 md:px-8">
            <div className="rounded-md border border-rose-900/15 bg-[linear-gradient(145deg,rgba(255,251,247,0.96),rgba(250,232,220,0.92))] p-5 shadow-[0_24px_60px_rgba(102,35,49,0.18)] md:p-8">
              
              {/* Header */}
              <div className="mb-6 flex flex-col gap-4 border-b border-rose-900/10 pb-5 md:flex-row md:items-center md:justify-between">
                <DashboardHeader />
                <div className="flex flex-wrap gap-3 md:justify-end">
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="rounded-full bg-rose-800 px-4 py-2 text-sm font-semibold text-rose-50 transition hover:bg-rose-900"
                    >
                      Logout
                    </button>
                  </form>
                </div>
              </div>

              {children}
            </div>
          </div>
        </InvitationFrame>
      </div>

      {/* ✅ Mobile View (NO InvitationFrame) */}
      <div className="md:hidden px-4 py-6">
        <div className="rounded-md border border-rose-900/15 bg-[linear-gradient(145deg,rgba(255,251,247,0.96),rgba(250,232,220,0.92))] p-5 shadow-[0_24px_60px_rgba(102,35,49,0.18)]">
          
          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 border-b border-rose-900/10 pb-5">
            <div className="flex items-start justify-between gap-3">
              <DashboardHeader mobile showNav={false} />
              <div className="shrink-0">
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="rounded-full bg-rose-800 px-3 py-1.5 text-sm font-semibold text-white"
                  >
                    Logout
                  </button>
                </form>
              </div>
            </div>
            <DashboardHeader mobile showHeading={false} />
          </div>

          {children}
        </div>
      </div>
    </>
  );
}
