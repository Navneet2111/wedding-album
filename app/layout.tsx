import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

const metaPreviewImage =
  "https://i.pinimg.com/736x/d9/64/35/d96435c0442c2de1d33129993556331f.jpg";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Anandi and Vineet Wedding",
    template: "%s | Anandi and Vineet Wedding",
  },
  description:
    "Private wedding invitation, dashboard, albums, and videos for Anandi and Vineet.",
  applicationName: "Anandi and Vineet Wedding",
  keywords: [
    "wedding",
    "wedding album",
    "wedding dashboard",
    "Anandi",
    "Vineet",
  ],
  openGraph: {
    title: "Anandi and Vineet Wedding",
    description:
      "Private wedding invitation, dashboard, albums, and videos for Anandi and Vineet.",
    type: "website",
    siteName: "Anandi and Vineet Wedding",
    images: [
      {
        url: metaPreviewImage,
        alt: "Anandi and Vineet wedding preview image",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Anandi and Vineet Wedding",
    description:
      "Private wedding invitation, dashboard, albums, and videos for Anandi and Vineet.",
    images: [metaPreviewImage],
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
