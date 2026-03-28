"use client";

type AuthLoaderProps = {
  label: string;
  fullScreen?: boolean;
};

export default function AuthLoader({
  label,
  fullScreen = false,
}: AuthLoaderProps) {
  return (
    <div
      className={`z-40 grid place-items-center bg-white/78 backdrop-blur-[2px] ${
        fullScreen
          ? "fixed inset-0"
          : "absolute inset-0 rounded-[inherit]"
      }`}
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <span
          className="h-10 w-10 animate-spin rounded-full border-4 border-rose-200 border-t-rose-800"
          aria-hidden="true"
        />
        <p className="text-sm font-semibold text-rose-900">{label}</p>
      </div>
    </div>
  );
}
