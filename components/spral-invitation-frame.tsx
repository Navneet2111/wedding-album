"use client";

import { ReactNode } from "react";

type SpiralInvitationFrameProps = {
  children: ReactNode;
  contentClassName?: string;
};

const ringYs = Array.from({ length: 21 }, (_, i) => 22 + i * 30);
const fabricYs = Array.from({ length: 86 }, (_, i) => i * 8);

function CornerMark({ flip }: { flip?: string }) {
  return (
    <svg
      style={{
        position: "absolute",
        width: 48,
        height: 48,
        pointerEvents: "none",
        transform: flip,
      }}
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2,2 L20,2 L20,4 L4,4 L4,20 L2,20 Z"
        fill="#c8a040"
        opacity="0.5"
      />
      <path d="M2,2 L2,6 L6,6 L6,2 Z" fill="#c8a040" opacity="0.85" />
      <circle cx="24" cy="2" r="1.5" fill="#c8a040" opacity="0.35" />
      <circle cx="2" cy="24" r="1.5" fill="#c8a040" opacity="0.35" />
      <circle
        cx="12"
        cy="12"
        r="2"
        fill="none"
        stroke="#c8a040"
        strokeWidth="0.5"
        opacity="0.3"
      />
    </svg>
  );
}

export default function SpiralInvitationFrame({
  children,
  contentClassName = "",
}: SpiralInvitationFrameProps) {
  return (
    <>
      {/* ── Keyframes (injected once, scoped with if- prefix) ── */}
      <style>{`
        @keyframes if-fadeIn     { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes if-textReveal { from{opacity:0;letter-spacing:.4em} to{opacity:1;letter-spacing:.22em} }
        @keyframes if-shimmer    { 0%,100%{opacity:.45} 50%{opacity:.9} }
        @keyframes if-goldPulse  { 0%,100%{opacity:.4}  50%{opacity:.75} }
        @keyframes if-floatUp    { 0%,100%{transform:translateY(0)}  50%{transform:translateY(-6px)} }
        @keyframes if-flicker    { 0%,100%{opacity:1;transform:scaleY(1) skewX(0deg)} 25%{opacity:.85;transform:scaleY(.93) skewX(2deg)} 75%{opacity:.95;transform:scaleY(.97) skewX(-1deg)} }
        @keyframes if-glowPulse  { 0%,100%{opacity:.3} 50%{opacity:.55} }
        @keyframes if-ringIn     { from{opacity:0;transform:scale(.6) rotate(-20deg)} to{opacity:1;transform:scale(1) rotate(0deg)} }
        @keyframes if-borderDraw { from{stroke-dashoffset:1200} to{stroke-dashoffset:0} }
        @keyframes if-petal1     { 0%{transform:translate(0,0) rotate(0deg);opacity:0} 10%{opacity:.7} 90%{opacity:.4} 100%{transform:translate(-40px,340px) rotate(180deg);opacity:0} }
        @keyframes if-petal2     { 0%{transform:translate(0,0) rotate(20deg);opacity:0} 10%{opacity:.6} 90%{opacity:.3} 100%{transform:translate(30px,400px) rotate(-140deg);opacity:0} }
        @keyframes if-petal3     { 0%{transform:translate(0,0) rotate(-10deg);opacity:0} 10%{opacity:.5} 90%{opacity:.35} 100%{transform:translate(-20px,370px) rotate(200deg);opacity:0} }
        @keyframes if-dust       { 0%{transform:translateY(0) translateX(0);opacity:0} 20%{opacity:.6} 80%{opacity:.3} 100%{transform:translateY(-80px) translateX(15px);opacity:0} }

        .if-petal{position:absolute;width:10px;height:14px;border-radius:50% 50% 50% 0;opacity:0;pointer-events:none}
        .if-petal:nth-child(1){top:-20px;left:30%;background:#d4a0b8;animation:if-petal1 7s ease-in 1.2s infinite}
        .if-petal:nth-child(2){top:-20px;left:50%;background:#e8b4a0;width:8px;height:11px;animation:if-petal2 9s ease-in 0s infinite}
        .if-petal:nth-child(3){top:-20px;left:20%;background:#d4b0c8;animation:if-petal3 8s ease-in 3s infinite}
        .if-petal:nth-child(4){top:-20px;left:60%;background:#e8c0b0;width:7px;height:10px;animation:if-petal1 10s ease-in 5s infinite}
        .if-petal:nth-child(5){top:-20px;left:40%;background:#e8a090;animation:if-petal2 7.5s ease-in 6.5s infinite}
        .if-petal:nth-child(6){top:-20px;left:70%;background:#c8a0b0;width:9px;height:12px;animation:if-petal3 11s ease-in 2s infinite}

        .if-mote{position:absolute;width:3px;height:3px;border-radius:50%;opacity:0;pointer-events:none}
        .if-mote:nth-child(1){bottom:140px;right:160px;background:#c8a040;animation:if-dust 6s ease-in 0s infinite}
        .if-mote:nth-child(2){bottom:220px;right:200px;background:#d4907a;animation:if-dust 8s ease-in 2s infinite}
        .if-mote:nth-child(3){bottom:100px;right:240px;background:#c8a040;animation:if-dust 7s ease-in 4s infinite}

        .if-border-anim   { stroke-dasharray:1200; animation:if-borderDraw 3s ease-out .5s both; }
        .if-candle-flame  { animation:if-flicker 1.4s ease-in-out infinite; transform-origin:bottom center; }
        .if-glow          { animation:if-glowPulse 2s ease-in-out infinite; }
        .if-glow2         { animation:if-glowPulse 2.3s ease-in-out .7s infinite; }
        .if-float         { animation:if-floatUp 5s ease-in-out infinite; }
        .if-float2        { animation:if-floatUp 6s ease-in-out 1.5s infinite; }
        .if-rings-in      { animation:if-ringIn 1.2s cubic-bezier(.34,1.56,.64,1) 2.4s both, if-floatUp 6s ease-in-out 1s infinite; }
        .if-shimmer       { animation:if-shimmer 4s ease-in-out 2s infinite; }
        .if-text-reveal   { animation:if-textReveal 1.8s ease-out .3s both; }
        .if-fade-06       { animation:if-fadeIn 1.4s ease-out .6s both; }
        .if-fade-12       { animation:if-fadeIn 1.4s ease-out 1.2s both; }
        .if-fade-15       { animation:if-fadeIn 1.4s ease-out 1.5s both; }
        .if-fade-18       { animation:if-fadeIn 1.4s ease-out 1.8s both; }

        /* Hide on mobile and tablet, show on desktop */
        @media (max-width: 1023px) {
          .spine-visible {
            display: none;
          }
        }
        @media (min-width: 1024px) {
          .spine-visible {
            display: block;
          }
        }
      `}</style>

      <main
        style={{
          display: "flex",
          height: "100dvh",
          overflow: "hidden",
          boxShadow:
            "-2px 0 0 #8a7060, 3px 6px 28px rgba(80,40,20,.28), 8px 12px 48px rgba(60,30,10,.16)",
          borderRadius: "3px 8px 8px 3px",
        }}
      >
        {/* ════════════════ SPINE ════════════════ */}
        <div
          className="spine-visible"
          style={{ width: 62, flexShrink: 0, position: "relative", zIndex: 10 }}
        >
          <svg
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
            }}
            viewBox="0 0 62 680"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="rs" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3a2a18" />
                <stop offset="20%" stopColor="#7a5c2e" />
                <stop offset="38%" stopColor="#c8a060" />
                <stop offset="50%" stopColor="#e8cc88" />
                <stop offset="62%" stopColor="#c09040" />
                <stop offset="80%" stopColor="#6a4820" />
                <stop offset="100%" stopColor="#2e1e0c" />
              </linearGradient>
              <linearGradient id="rb" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#0e0906" />
                <stop offset="50%" stopColor="#2a1e10" />
                <stop offset="100%" stopColor="#0e0906" />
              </linearGradient>
              <linearGradient id="sbg" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#120e08" />
                <stop offset="40%" stopColor="#1e1610" />
                <stop offset="100%" stopColor="#160e08" />
              </linearGradient>
            </defs>
            <rect width="62" height="680" fill="url(#sbg)" />
            <g opacity="0.055">
              {fabricYs.map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2="62"
                  y2={y}
                  stroke="#d4b880"
                  strokeWidth="0.5"
                />
              ))}
            </g>
            <rect
              x="0"
              y="0"
              width="62"
              height="9"
              fill="#c8a040"
              opacity="0.18"
            />
            <rect
              x="0"
              y="671"
              width="62"
              height="9"
              fill="#c8a040"
              opacity="0.18"
            />
            <g opacity="0.48">
              {ringYs.map((y) => (
                <ellipse
                  key={y}
                  cx="31"
                  cy={y}
                  rx="18"
                  ry="5.5"
                  fill="none"
                  stroke="url(#rb)"
                  strokeWidth="4"
                />
              ))}
            </g>
            <g>
              {ringYs.map((y) => (
                <ellipse
                  key={y}
                  cx="31"
                  cy={y}
                  rx="18"
                  ry="5.5"
                  fill="none"
                  stroke="url(#rs)"
                  strokeWidth="4"
                  strokeDasharray="31 25"
                  strokeDashoffset="2"
                />
              ))}
            </g>
            <rect
              x="59"
              y="0"
              width="3"
              height="680"
              fill="url(#rs)"
              opacity="0.9"
            />
          </svg>
        </div>

        {/* ════════════════ BOTANICAL STRIP ════════════════ */}
        <div
          style={{
            width: 84,
            flexShrink: 0,
            position: "relative",
            borderRight: "1px solid rgba(180,140,100,.2)",
          }}
        >
          <svg
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
            }}
            viewBox="0 0 84 680"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="cbg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f8f0e4" />
                <stop offset="50%" stopColor="#f2e8d8" />
                <stop offset="100%" stopColor="#ede0cc" />
              </linearGradient>
            </defs>
            <rect width="84" height="680" fill="url(#cbg)" />
            <line
              x1="6"
              y1="14"
              x2="6"
              y2="666"
              stroke="#c8a040"
              strokeWidth="0.5"
              opacity="0.5"
            />
            <line
              x1="10"
              y1="14"
              x2="10"
              y2="666"
              stroke="#c8a040"
              strokeWidth="0.3"
              opacity="0.3"
            />

            {/* Top rose cluster */}
            <g opacity="0.78">
              <path
                d="M42,14 C40,90 44,160 42,230"
                fill="none"
                stroke="#7a9060"
                strokeWidth="1.5"
              />
              <path
                d="M42,65 C30,57 24,46 28,38 C32,46 40,57 42,65Z"
                fill="#8aa060"
                opacity="0.7"
              />
              <path
                d="M42,65 C54,57 60,46 56,38 C52,46 44,57 42,65Z"
                fill="#9ab070"
                opacity="0.6"
              />
              <path
                d="M42,130 C31,122 26,110 30,100 C34,110 40,122 42,130Z"
                fill="#8aa060"
                opacity="0.65"
              />
              <path
                d="M42,130 C53,122 58,110 54,100 C50,110 44,122 42,130Z"
                fill="#9ab070"
                opacity="0.55"
              />
              <circle cx="42" cy="32" r="11" fill="#e8b4a0" opacity="0.38" />
              <path
                d="M42,20 C46,22 48,27 46,32 C44,35 42,35 42,32 C42,30 40,27 38,29 C36,32 38,35 40,35 C38,32 38,27 42,20Z"
                fill="#d4806a"
              />
              <path
                d="M42,20 C38,22 36,27 38,32 C40,35 42,35 42,32 C42,30 44,27 46,29 C48,32 46,35 44,35 C46,32 46,27 42,20Z"
                fill="#e09080"
                opacity="0.85"
              />
              <path
                d="M42,25 C45,26 46,30 44,32 C43,33 42,33 42,32 C42,29 40,28 39,30 C38,32 40,33 42,32 C40,31 40,28 42,25Z"
                fill="#c86850"
              />
              <circle cx="42" cy="29" r="3.2" fill="#a84830" />
              <ellipse
                cx="37"
                cy="100"
                rx="4"
                ry="6"
                fill="#e8c0b0"
                opacity="0.7"
              />
              <ellipse cx="37" cy="100" rx="2" ry="4" fill="#d4907a" />
              <ellipse
                cx="47"
                cy="170"
                rx="4"
                ry="6"
                fill="#e8c0b0"
                opacity="0.7"
              />
              <ellipse cx="47" cy="170" rx="2" ry="4" fill="#d4907a" />
            </g>

            {/* Middle hydrangea cluster */}
            <g opacity="0.72">
              <path
                d="M42,230 C40,300 44,360 42,430"
                fill="none"
                stroke="#7a9060"
                strokeWidth="1.5"
              />
              <path
                d="M42,268 C29,258 24,244 29,232 C34,244 40,258 42,268Z"
                fill="#8aa060"
                opacity="0.7"
              />
              <path
                d="M42,268 C55,258 60,244 55,232 C50,244 44,258 42,268Z"
                fill="#9ab070"
                opacity="0.6"
              />
              <path
                d="M42,340 C30,330 25,316 30,304 C34,316 40,330 42,340Z"
                fill="#8aa060"
                opacity="0.65"
              />
              <g transform="translate(42,248)">
                <circle cx="-6" cy="-6" r="5.5" fill="#c0a8d0" opacity="0.7" />
                <circle cx="6" cy="-6" r="5.5" fill="#b898c8" opacity="0.7" />
                <circle cx="-6" cy="6" r="5.5" fill="#c8b0d8" opacity="0.65" />
                <circle cx="6" cy="6" r="5.5" fill="#b8a0c8" opacity="0.65" />
                <circle cx="0" cy="0" r="5.5" fill="#d0b8e0" opacity="0.8" />
                <circle cx="0" cy="-9" r="4" fill="#b898c8" opacity="0.6" />
                <circle cx="9" cy="0" r="4" fill="#c0a8d0" opacity="0.6" />
                <circle cx="-9" cy="0" r="4" fill="#b898c8" opacity="0.6" />
                <circle cx="0" cy="9" r="4" fill="#c8b0d8" opacity="0.6" />
                <circle cx="0" cy="0" r="3.5" fill="#8060a0" />
                <circle cx="0" cy="0" r="1.8" fill="#604080" />
              </g>
              <path
                d="M42,390 C31,380 27,366 31,356 C35,366 40,380 42,390Z"
                fill="#8aa060"
                opacity="0.6"
              />
              <path
                d="M42,390 C53,380 57,366 53,356 C49,366 44,380 42,390Z"
                fill="#9ab070"
                opacity="0.55"
              />
            </g>

            {/* Bottom rose + baby's breath */}
            <g opacity="0.72">
              <path
                d="M42,430 C40,500 44,560 42,670"
                fill="none"
                stroke="#7a9060"
                strokeWidth="1.5"
              />
              <path
                d="M42,460 C30,450 25,436 30,424 C34,436 40,450 42,460Z"
                fill="#8aa060"
                opacity="0.65"
              />
              <path
                d="M42,460 C54,450 59,436 54,424 C50,436 44,450 42,460Z"
                fill="#9ab070"
                opacity="0.55"
              />
              <circle cx="42" cy="508" r="12" fill="#e8b4a0" opacity="0.33" />
              <path
                d="M42,495 C46,497 49,503 47,508 C45,512 42,512 42,508 C42,505 40,502 38,504 C36,508 38,512 40,512 C38,508 38,503 42,495Z"
                fill="#d4806a"
              />
              <path
                d="M42,495 C38,497 35,503 37,508 C39,512 42,512 42,508 C42,505 44,502 46,504 C48,508 46,512 44,512 C46,508 46,503 42,495Z"
                fill="#e09080"
                opacity="0.85"
              />
              <circle cx="42" cy="505" r="3.8" fill="#a84830" />
              <path
                d="M42,548 C31,538 27,524 31,514 C35,524 40,538 42,548Z"
                fill="#8aa060"
                opacity="0.65"
              />
              <path
                d="M42,548 C53,538 57,524 53,514 C49,524 44,538 42,548Z"
                fill="#9ab070"
                opacity="0.55"
              />
              <circle cx="32" cy="610" r="2.5" fill="#e8dac8" opacity="0.8" />
              <circle cx="38" cy="604" r="2" fill="#e0d0be" opacity="0.75" />
              <circle cx="46" cy="612" r="2.5" fill="#e8dac8" opacity="0.8" />
              <circle cx="52" cy="606" r="2" fill="#e0d0be" opacity="0.7" />
              <circle cx="40" cy="618" r="2" fill="#e8dac8" opacity="0.7" />
              <path
                d="M42,658 C31,648 27,635 31,624 C35,635 40,648 42,658Z"
                fill="#8aa060"
                opacity="0.5"
              />
              <path
                d="M42,658 C53,648 57,635 53,624 C49,635 44,648 42,658Z"
                fill="#9ab070"
                opacity="0.45"
              />
            </g>
            <rect
              x="62"
              y="0"
              width="22"
              height="680"
              fill="rgba(100,70,40,.06)"
            />
          </svg>
        </div>

        {/* ════════════════ MAIN PAGE ════════════════ */}
        <div
          style={{
            flex: 1,
            position: "relative",
            background: "#fdfaf5",
            overflow: "hidden",
          }}
        >
          {/* Ruled lines */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              backgroundImage:
                "repeating-linear-gradient(180deg,transparent 0px,transparent 31px,rgba(180,150,120,.06) 31px,rgba(180,150,120,.06) 32px)",
            }}
          />

          {/* Double mat borders */}
          <div
            style={{
              position: "absolute",
              inset: 20,
              border: "1px solid rgba(180,140,100,.22)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 26,
              border: "0.5px solid rgba(180,140,100,.13)",
              pointerEvents: "none",
            }}
          />

          {/* Animated gold border draw */}
          <svg
            style={{
              position: "absolute",
              inset: 20,
              width: "calc(100% - 40px)",
              height: "calc(100% - 40px)",
              pointerEvents: "none",
              overflow: "visible",
            }}
            viewBox="0 0 400 640"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="1"
              y="1"
              width="398"
              height="638"
              fill="none"
              stroke="#c8a040"
              strokeWidth="0.8"
              opacity="0.35"
              className="if-border-anim"
            />
          </svg>

          {/* Falling petals */}
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="if-petal" />
          ))}

          {/* Dust motes */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="if-mote" />
          ))}

          {/* Corner ornaments */}
          <div style={{ position: "absolute", top: 14, left: 14 }}>
            <CornerMark />
          </div>
          <div style={{ position: "absolute", top: 14, right: 14 }}>
            <CornerMark flip="scaleX(-1)" />
          </div>
          <div style={{ position: "absolute", bottom: 14, left: 14 }}>
            <CornerMark flip="scaleY(-1)" />
          </div>
          <div style={{ position: "absolute", bottom: 14, right: 14 }}>
            <CornerMark flip="scale(-1,-1)" />
          </div>

          {/* ── CONTENT SLOT ── */}
          {/* Scrollable section */}
          <section
            className={`relative ${contentClassName} pr-0 lg:pr-6 lg:pt-2`}
            style={{
              zIndex: 2,
              height: "100%",
              overflowY: "auto",
              paddingRight: "20px",
              paddingLeft: "20px",
              scrollbarWidth: "thin",
            }}
          >
            {children}
          </section>
        </div>
      </main>
    </>
  );
}