import type { Metadata } from "next";
import LoginForm from "@/components/login-form";
import {
  openGraphImageUrl,
  siteMetadata,
  siteUrl,
  twitterImageUrl,
} from "@/lib/site-metadata";
export const metadata: Metadata = {
  title: "Login",
  description:
    "Secure login for the private Anandi and Vineet wedding dashboard, albums, and video gallery.",
  openGraph: {
    title: "Login | Anandi and Vineet Wedding",
    description:
      "Secure login for the private Anandi and Vineet wedding dashboard, albums, and video gallery.",
    url: `${siteUrl}/login`,
    images: [
      {
        url: openGraphImageUrl,
        alt: "Wedding image for Anandi and Vineet login page",
        width: siteMetadata.ogImageWidth,
        height: siteMetadata.ogImageHeight,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Login | Anandi and Vineet Wedding",
    description:
      "Secure login for the private Anandi and Vineet wedding dashboard, albums, and video gallery.",
    images: [
      {
        url: twitterImageUrl,
        alt: "Wedding image for Anandi and Vineet login page",
        width: siteMetadata.ogImageWidth,
        height: siteMetadata.ogImageHeight,
      },
    ],
  },
};

export default function LoginPage() {
  return <LoginForm />;
}
