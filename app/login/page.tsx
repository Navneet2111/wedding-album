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
        url: "/ganeshBhgwan.png",
        alt: "Ganesh Bhagwan artwork for the Anandi and Vineet wedding login page",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Login | Anandi and Vineet Wedding",
    description:
      "Secure login for the private Anandi and Vineet wedding dashboard, albums, and video gallery.",
    images: ["/ganeshBhgwan.png"],
  },
};

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  }

  return <LoginForm />;
}
