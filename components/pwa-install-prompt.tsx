"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const DISMISS_KEY = "wedding-pwa-install-dismissed";

export default function PwaInstallPrompt() {
  const getIsIos = () =>
    typeof window !== "undefined" &&
    /iPad|iPhone|iPod/.test(window.navigator.userAgent);

  const getIsStandalone = () =>
    typeof window !== "undefined" &&
    (window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
        true);

  const getDismissed = () =>
    typeof window === "undefined" ||
    window.localStorage.getItem(DISMISS_KEY) === "true";

  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isIos] = useState(getIsIos);
  const [isStandalone, setIsStandalone] = useState(getIsStandalone);
  const [dismissed, setDismissed] = useState(getDismissed);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      });
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setDismissed(false);
    };

    const handleAppInstalled = () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
      setDismissed(true);
      window.localStorage.setItem(DISMISS_KEY, "true");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleDismiss = () => {
    window.localStorage.setItem(DISMISS_KEY, "true");
    setDismissed(true);
  };

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setDismissed(true);
      window.localStorage.setItem(DISMISS_KEY, "true");
    }
  };

  if (isStandalone || dismissed || (!isIos && !deferredPrompt)) {
    return null;
  }

  return (
    <div className="mx-auto mt-6 w-full max-w-md rounded-[24px] border border-rose-900/10 bg-[linear-gradient(140deg,rgba(255,252,249,0.97),rgba(255,233,221,0.94))] p-4 text-left shadow-[0_18px_40px_rgba(102,35,49,0.16)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-900/75">
            Better On Home Screen
          </p>
          <h2 className="mt-1 text-lg font-semibold text-rose-950">
            Add Wedding VK to your phone
          </h2>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="rounded-full px-2 py-1 text-sm text-rose-900/65 transition hover:bg-white/60 hover:text-rose-950"
          aria-label="Dismiss install prompt"
        >
          Not now
        </button>
      </div>

      {deferredPrompt ? (
        <div className="mt-3">
          <p className="text-sm leading-6 text-rose-900/80">
            Install the app for a cleaner, one-tap experience the next time you
            open it.
          </p>
          <button
            type="button"
            onClick={handleInstall}
            className="mt-4 inline-flex items-center justify-center rounded-full bg-rose-800 px-5 py-3 text-sm font-semibold text-rose-50 shadow-[0_12px_24px_rgba(90,20,33,0.24)] transition hover:bg-rose-900"
          >
            Install App
          </button>
        </div>
      ) : (
        <div className="mt-3 space-y-2 text-sm leading-6 text-rose-900/80">
          <p>On iPhone, Safari does not show an install button automatically.</p>
          <p>Tap Share, then choose Add to Home Screen.</p>
        </div>
      )}
    </div>
  );
}
