"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type DashboardHeaderProps = {
  mobile?: boolean;
  showNav?: boolean;
  showHeading?: boolean;
};

const navItems = [
  { href: "/dashboard", label: "Dashboard", heading: "Anandi and Vineet" },
  {
    href: "/dashboard/album",
    label: "Album",
    heading: "Wedding Photo",
  },
  {
    href: "/dashboard/video",
    label: "Video",
    heading: "Wedding Videos",
  },
];

export default function DashboardHeader({
  mobile = false,
  showNav = true,
  showHeading = true,
}: DashboardHeaderProps) {
  const pathname = usePathname();

  const current =
    navItems.find((item) => item.href === pathname) ||
    navItems.find((item) => pathname.startsWith(item.href)) ||
    navItems[0];

  return (
    <>
      {showHeading ? (
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-rose-800/80">
            {current.label}
          </p>
          <h1
            className={`mt-2 font-serif font-bold text-rose-950 ${
              mobile ? "text-2xl" : "text-2xl lg:text-3xl"
            }`}
          >
            {current.heading}
          </h1>
        </div>
      ) : null}

      {showNav ? (
        <div className="flex flex-wrap gap-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full border font-semibold transition ${
                mobile
                  ? "px-3 py-1.5 text-sm"
                  : "px-2 py-2 text-sm"
              } ${
                pathname === item.href
                  ? "bg-rose-800 text-white border-rose-800"
                  : "bg-white/70 text-rose-900 border-rose-800/15 hover:border-rose-800/35 hover:bg-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      ) : null}
    </>
  );
}
