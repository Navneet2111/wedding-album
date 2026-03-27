import Image from "next/image";
import { ReactNode } from "react";

type InvitationCardProps = {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
};

export default function InvitationCard({
  children,
  className = "",
  title = "Anandi & Vineet",
  description = "A celebration of love, rituals, and family. Click the envelope card to continue to login.",
}: InvitationCardProps) {
  return (
    <div
      className={`w-full max-w-xl rounded-[28px] border-rose-900/15 p-6 sm:p-10 md:border md:bg-[linear-gradient(140deg,rgba(255,251,247,0.96),rgba(250,232,220,0.9))] md:shadow-[0_24px_60px_rgba(102,35,49,0.24)] ${className}`}
    >
      <Image
        src="/ganeshBhgwan.png"
        alt="Ganesh Bhagwan"
        width={160}
        height={160}
        priority
        className="mx-auto mb-4 h-auto w-32 object-contain text-rose-950 [animation:ganeshFloat_3s_ease-in-out_infinite] sm:w-36 lg:w-24"
      />
      <h1 className="mt-3 text-center font-serif text-2xl font-bold text-rose-950 md:text-3xl lg:text-4xl">
        {title}
      </h1>
      <p className="mx-auto mt-4 max-w-md text-center text-sm text-rose-900/80 sm:text-base">
        {description}
      </p>
      {children}
    </div>
  );
}
