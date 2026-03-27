import type { Metadata } from "next";
import HomeClient from "@/components/home-client";

export const metadata: Metadata = {
  title: "Wedding Album",
  description:
    "Open the wedding Album for Anandi and Vineet and continue to the private dashboard login.",
  openGraph: {
    title: "Wedding Album | Anandi and Vineet Wedding",
    description:
      "Open the wedding Album for Anandi and Vineet and continue to the private dashboard login.",
    images: [
      {
        url: "/WelcomeImage.png",
        alt: "Welcome image for Anandi and Vineet wedding invitation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wedding Album | Anandi and Vineet Wedding",
    description:
      "Open the wedding Album for Anandi and Vineet and continue to the private dashboard login.",
    images: ["/WelcomeImage.png"],
  },
};

export default function Home() {
  return <HomeClient />;
}
