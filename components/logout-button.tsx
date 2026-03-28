"use client";

import { useState } from "react";
import { signOut } from "firebase/auth";
import AuthLoader from "@/components/auth-loader";
import { getFirebaseAuth } from "@/lib/firebase-client";

type LogoutButtonProps = {
  className: string;
};

export default function LogoutButton({ className }: LogoutButtonProps) {
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    if (pending) {
      return;
    }

    setPending(true);

    try {
      await signOut(getFirebaseAuth());
    } catch {
      // Ignore logout errors and force the route change.
    } finally {
      window.location.replace("/");
    }
  }

  return (
    <div className="relative">
      {pending ? <AuthLoader label="Logging you out..." fullScreen /> : null}
      <button type="button" onClick={handleLogout} disabled={pending} className={className}>
        {pending ? "Logging out..." : "Logout"}
      </button>
    </div>
  );
}
