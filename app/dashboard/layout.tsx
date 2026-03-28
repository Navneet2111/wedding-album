import type { Metadata } from "next";
import { ReactNode } from "react";
import AuthGuard from "@/components/auth-guard";
import DashboardShell from "@/components/dashboard-shell";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Private wedding dashboard for Anandi and Vineet with albums and video collections.",
};

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <AuthGuard>
      <DashboardShell>{children}</DashboardShell>
    </AuthGuard>
  );
}
