import { ReactNode } from "react";

type InvitationFrameProps = {
  children: ReactNode;
  contentClassName?: string;
};

export default function InvitationFrame({
  children,
  contentClassName = "",
}: InvitationFrameProps) {
  return (
    <main className="relative min-h-dvh overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#fff9f0,#fdecd8,#fff0e8,#fae0cc)] bg-[length:300%_300%] animate-[bgShift_8s_ease_infinite]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,248,239,0.3),rgba(248,215,196,0.55),rgba(239,192,168,0.7))]" />

      <div className="pointer-events-none absolute inset-0 z-10">
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 160"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern
              id="geo"
              x="0"
              y="0"
              width="8"
              height="8"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M0,4 L4,0 L8,4 L4,8 Z"
                fill="none"
                stroke="#c07860"
                strokeWidth="0.35"
                opacity="0.6"
              />
              <circle cx="4" cy="4" r="0.8" fill="#c07860" opacity="0.5" />
            </pattern>
          </defs>

          <rect
            x="0"
            y="0"
            width="11"
            height="160"
            fill="url(#geo)"
            className="geo-pat"
          />
          <rect
            x="89"
            y="0"
            width="11"
            height="160"
            fill="url(#geo)"
            className="geo-pat"
          />
          <rect
            x="0"
            y="0"
            width="100"
            height="11"
            fill="url(#geo)"
            className="geo-pat"
          />
          <rect
            x="0"
            y="149"
            width="100"
            height="11"
            fill="url(#geo)"
            className="geo-pat"
          />

          <rect
            x="11"
            y="11"
            width="78"
            height="138"
            fill="none"
            stroke="#d4906a"
            strokeWidth="0.25"
          />

          <line
            x1="30"
            y1="5.5"
            x2="70"
            y2="5.5"
            stroke="#b06840"
            strokeWidth="0.4"
            strokeDasharray="3,2"
            className="border-anim"
          />
          <line
            x1="5.5"
            y1="30"
            x2="5.5"
            y2="130"
            stroke="#b06840"
            strokeWidth="0.4"
            strokeDasharray="3,2"
            className="border-side"
          />
          <line
            x1="94.5"
            y1="30"
            x2="94.5"
            y2="130"
            stroke="#b06840"
            strokeWidth="0.4"
            strokeDasharray="3,2"
            className="border-side"
          />
          <line
            x1="30"
            y1="154.5"
            x2="70"
            y2="154.5"
            stroke="#b06840"
            strokeWidth="0.4"
            strokeDasharray="3,2"
            className="border-anim"
          />

          <polygon
            points="5.5,50 8,55 5.5,60 3,55"
            fill="#d08060"
            opacity="0.65"
          />
          <polygon
            points="5.5,100 8,105 5.5,110 3,105"
            fill="#d08060"
            opacity="0.65"
          />
          <polygon
            points="94.5,50 97,55 94.5,60 92,55"
            fill="#d08060"
            opacity="0.65"
          />
          <polygon
            points="94.5,100 97,105 94.5,110 92,105"
            fill="#d08060"
            opacity="0.65"
          />
          <polygon
            points="35,5.5 40,8 35,10.5 30,8"
            fill="#d08060"
            opacity="0.6"
          />
          <polygon
            points="65,5.5 70,8 65,10.5 60,8"
            fill="#d08060"
            opacity="0.6"
          />
          <polygon
            points="35,154.5 40,157 35,159.5 30,157"
            fill="#d08060"
            opacity="0.6"
          />
          <polygon
            points="65,154.5 70,157 65,159.5 60,157"
            fill="#d08060"
            opacity="0.6"
          />
        </svg>
      </div>

      <section className={`relative z-20 ${contentClassName}`}>{children}</section>
    </main>
  );
}
