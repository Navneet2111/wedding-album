"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/logout-button";

export default function DashboardActionButton() {
  const pathname = usePathname();
  const isAlbumDetail = pathname.startsWith("/dashboard/album/");

  if (isAlbumDetail) {
    return (
      <Link
        href="/dashboard/album"
        className="rounded-full border border-rose-800/20 bg-white/80 px-4 py-2 text-sm font-semibold text-rose-900 transition hover:border-rose-800/35 hover:bg-white"
      >
        Back
      </Link>
    );
  }

  return (
    <LogoutButton className="rounded-full bg-rose-800 px-4 py-2 text-sm font-semibold text-rose-50 transition hover:bg-rose-900 disabled:cursor-not-allowed disabled:opacity-70" />
  );
}
