"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import AuthLoader from "@/components/auth-loader";
import { getFirebaseAuth } from "@/lib/firebase-client";

type AuthGuardProps = {
  children: ReactNode;
};

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const auth = getFirebaseAuth();

    return onAuthStateChanged(auth, (user) => {
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
    });
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
