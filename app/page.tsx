import type { Metadata } from "next";
import HomeClient from "@/components/home-client";

const metaPreviewImage =
  // "https://i.pinimg.com/736x/d9/64/35/d96435c0442c2de1d33129993556331f.jpg";
"https://i.pinimg.com/736x/30/12/85/301285f850a317256209321bffc63792.jpg";
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
        url: metaPreviewImage,
        alt: "Wedding image for Anandi and Vineet",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wedding Album | Anandi and Vineet Wedding",
    description:
      "Open the wedding Album for Anandi and Vineet and continue to the private dashboard login.",
    images: [metaPreviewImage],
  },
};

export default function Home() {
  return <HomeClient />;
}
