import type { Metadata } from "next";
import { redirect } from "next/navigation";
import LoginForm from "@/components/login-form";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Login",
  description:
    "Secure login for the private Anandi and Vineet wedding dashboard, albums, and video gallery.",
  openGraph: {
    title: "Login | Anandi and Vineet Wedding",
    description:
      "Secure login for the private Anandi and Vineet wedding dashboard, albums, and video gallery.",
    images: [
      {
        url: "/meta-wedding.png",
        alt: "Wedding  image for Anandi and Vineet login page",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Login | Anandi and Vineet Wedding",
    description:
      "Secure login for the private Anandi and Vineet wedding dashboard, albums, and video gallery.",
    images: ["/wedding.JPG"],
  },
};

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  }

  return <LoginForm />;
}
