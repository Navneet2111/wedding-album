import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {
  openGraphImageUrl,
  siteMetadata,
  siteUrl,
  twitterImageUrl,
} from "@/lib/site-metadata";
import "./globals.css";

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
    default: siteMetadata.title,
    template: `%s | ${siteMetadata.title}`,
  },
  description: siteMetadata.description,
  applicationName: siteMetadata.title,
  keywords: [
    "wedding",
    "wedding album",
    "wedding dashboard",
    "Anandi",
    "Vineet",
  ],
  openGraph: {
    title: siteMetadata.title,
    description: siteMetadata.description,
    type: "website",
    url: siteUrl,
    siteName: siteMetadata.title,
    images: [
      {
        url: openGraphImageUrl,
        alt: siteMetadata.ogImageAlt,
        width: siteMetadata.ogImageWidth,
        height: siteMetadata.ogImageHeight,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteMetadata.title,
    description: siteMetadata.description,
    images: [
      {
        url: twitterImageUrl,
        alt: siteMetadata.ogImageAlt,
        width: siteMetadata.ogImageWidth,
        height: siteMetadata.ogImageHeight,
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#2d1513",
  colorScheme: "light",
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
