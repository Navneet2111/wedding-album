"use client";

import { useEffect, useId, useRef } from "react";

export type DownloadOutcome =
  | "success"
  | "partial"
  | "cancelled"
  | "error"
  | null;

type DownloadProgressDialogProps = {
  open: boolean;
  preparing: boolean;
  completed: number;
  total: number;
  message: string;
  outcome: DownloadOutcome;
  onCancel: () => void;
  onDismiss: () => void;
  onRetry?: () => void;
};

export default function DownloadProgressDialog({
  open,
  preparing,
  completed,
  total,
  message,
  outcome,
  onCancel,
  onDismiss,
  onRetry,
}: DownloadProgressDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const headingId = useId();
  const descriptionId = useId();
  const percentage = total
    ? Math.min(100, Math.round((completed / total) * 100))
    : 0;

  useEffect(() => {
    const element = dialog.current;
    if (!open || !element) return;
    element.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      element.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const heading = preparing
    ? "Preparing your memories"
    : outcome === "success"
      ? "Your photos are ready"
      : outcome === "partial"
        ? "Some photos are ready"
        : outcome === "cancelled"
          ? "Download cancelled"
          : "Could not prepare your photos";

  return (
    <dialog
      ref={dialog}
      aria-labelledby={headingId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault();
        if (preparing) onCancel();
        else onDismiss();
      }}
      className="fixed inset-0 m-auto max-h-[85dvh] w-[calc(100%_-_2rem)] max-w-md overflow-y-auto rounded-3xl border border-rose-200 bg-[#fffaf5] p-6 text-rose-950 shadow-[0_24px_90px_rgba(50,10,25,0.3)] backdrop:bg-rose-950/60 backdrop:backdrop-blur-sm sm:p-8"
    >
      <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-rose-100/70 text-rose-800">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-8 w-8"
        >
          {outcome === "success" && !preparing ? (
            <path d="m5 12 4 4L19 6" />
          ) : (
            <path d="M12 3v12m-5-5 5 5 5-5M5 16v5h14v-5" />
          )}
        </svg>
      </div>
      <p className="text-center text-[10px] font-semibold uppercase tracking-[0.24em] text-rose-800/65">
        Loved Images
      </p>
      <h2
        id={headingId}
        className="mt-2 text-center font-serif text-2xl font-bold sm:text-3xl"
      >
        {heading}
      </h2>
      <p
        id={descriptionId}
        role="status"
        className="mt-3 text-center text-sm leading-6 text-rose-900/75"
      >
        {preparing
          ? "Gathering your favourite photos. Keep this page open while we prepare your download."
          : message}
      </p>
      {preparing && (
        <div className="mt-6 rounded-2xl border border-rose-900/10 bg-white/70 p-4">
          <div className="mb-3 flex items-center justify-between gap-3 text-sm text-rose-900">
            <span className="inline-flex items-center gap-2">
              <span
                aria-hidden="true"
                className="h-4 w-4 animate-spin rounded-full border-2 border-rose-200 border-t-rose-800 motion-reduce:animate-none"
              />
              {completed === total && total > 0
                ? "Finishing download..."
                : `Preparing ${completed} of ${total} photos`}
            </span>
            <span className="font-semibold tabular-nums">{percentage}%</span>
          </div>
          <div
            role="progressbar"
            aria-label="Preparing photos"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percentage}
            className="h-2 overflow-hidden rounded-full bg-rose-100"
          >
            <div
              className="h-full rounded-full bg-rose-800 transition-[width] duration-300 motion-reduce:transition-none"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}
      <div className="mt-6 flex  justify-center gap-3">
        {preparing ? (
          <button
            type="button"
            onClick={onCancel}
            className="min-h-11 w-full rounded-full border border-rose-800/25 bg-white px-5 py-3 text-sm font-semibold text-rose-900 transition hover:bg-rose-50"
          >
            Cancel download
          </button>
        ) : (
            <button
              type="button"
              onClick={onDismiss}
              className="min-h-11 flex-1 rounded-full bg-rose-800 px-5 max-w-24  py-3 text-sm font-semibold text-white transition hover:bg-rose-900"
            >
              Done
            </button>
        )}
      </div>
    </dialog>
  );
}
