"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import AuthLoader from "@/components/auth-loader";
import { getFirebaseAuth } from "@/lib/firebase-client";
import { hasFirebaseConfig, onLocalAuthStateChanged } from "@/lib/local-auth";

type AuthGuardProps = {
  children: ReactNode;
};

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const handleUser = (user: { email?: string | null } | null) => {
      if (!user) {
        if (pathname !== "/login") {
          router.replace("/");
        }

        setReady(true);
        return;
      }

      if (pathname === "/login") {
        router.replace("/dashboard");
      }

      setReady(true);
    };

    if (!hasFirebaseConfig()) {
      return onLocalAuthStateChanged(handleUser);
    }

    const auth = getFirebaseAuth();

    return onAuthStateChanged(auth, handleUser);
  }, [pathname, router]);

  if (!ready) {
    return (
      <div className="relative min-h-[40vh]">
        <AuthLoader label="Checking access..." />
      </div>
    );
  }

  return <>{children}</>;
}
