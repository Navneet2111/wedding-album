import type { Metadata } from "next";
import HomeClient from "@/components/home-client";
import {
  openGraphImageUrl,
  siteMetadata,
  siteUrl,
  twitterImageUrl,
} from "@/lib/site-metadata";
export const metadata: Metadata = {
  title: "Wedding Album",
  description:
    "Open the wedding Album for Anandi and Vineet and continue to the private dashboard login.",
  openGraph: {
    title: "Vineet & Anandi | Wedding Album",
    description:
      "Open the wedding Album of  Vineet & Anandi and continue to the private dashboard login.",
    url: siteUrl,
    images: [
      {
        url: openGraphImageUrl,
        alt: "Wedding image for Anandi and Vineet",
        width: siteMetadata.ogImageWidth,
        height: siteMetadata.ogImageHeight,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wedding Album | Anandi and Vineet Wedding",
    description:
      "Open the wedding Album for Anandi and Vineet and continue to the private dashboard login.",
    images: [
      {
        url: twitterImageUrl,
        alt: "Wedding image for Anandi and Vineet",
        width: siteMetadata.ogImageWidth,
        height: siteMetadata.ogImageHeight,
      },
    ],
  },
};

export default function Home() {
  return <HomeClient />;
}
