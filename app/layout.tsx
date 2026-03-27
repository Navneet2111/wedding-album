import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  metadataBase: new URL("https://wedding-album.local"),
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
