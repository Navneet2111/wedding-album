import type { Metadata } from "next";
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
    siteName: siteMetadata.title,
    images: [
      {
        url: openGraphImageUrl,
        alt: siteMetadata.ogImageAlt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteMetadata.title,
    description: siteMetadata.description,
    images: [twitterImageUrl],
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
