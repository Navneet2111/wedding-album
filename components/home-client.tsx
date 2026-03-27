"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import InvitationCard from "@/components/invitation-card";
import InvitationFrame from "@/components/invitation-frame";

export default function HomeClient() {
  const router = useRouter();
  const [opening, setOpening] = useState(false);

  const handleOpen = () => {
    if (opening) return;
    setOpening(true);
    setTimeout(() => {
      router.push("/login");
    }, 650);
  };

  return (
    <InvitationFrame contentClassName="mx-auto grid min-h-dvh w-full max-w-xl place-items-center px-6 py-7 pt-1 md:px-4 md:py-4">
      <InvitationCard>
        <button
          type="button"
          onClick={handleOpen}
          className="group relative mx-auto mt-8 block h-56 w-full max-w-md cursor-pointer rounded-b-2xl bg-transparent [perspective:1000px] sm:h-60"
          aria-label="Open wedding card and continue to secure login"
        >
          <span
            className={`absolute inset-x-0 top-0 z-20 h-1/2 origin-top bg-[linear-gradient(135deg,#ffe6d1,#efbca6)] [clip-path:polygon(0_0,100%_0,50%_100%)] transition-transform duration-700 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] ${
              opening ? "[transform:rotateX(180deg)]" : ""
            }`}
          />
          <span className="absolute inset-0 rounded-b-2xl bg-[linear-gradient(145deg,#ffeada,#f1c5b0_72%,#e7ac95)] shadow-[0_16px_30px_rgba(80,24,35,0.25)]" />
          <span
            className={`absolute left-1/2 top-[40%] z-30 grid h-16 w-16 -translate-x-1/2 place-items-center rounded-full bg-rose-800 text-xs font-bold tracking-[0.18em] text-rose-50 shadow-[0_10px_18px_rgba(90,20,33,0.34)] transition-opacity duration-300 ${
              opening ? "opacity-0" : "opacity-100"
            }`}
          >
            A V
          </span>
        </button>
      </InvitationCard>
    </InvitationFrame>
  );
}
