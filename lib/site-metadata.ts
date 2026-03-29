export const siteMetadata = {
  title: "Anandi and Vineet Wedding",
  description:
    "Private wedding invitation, dashboard, albums, and videos for Anandi and Vineet.",
  ogImageAlt: "Anandi and Vineet wedding preview image",
  ogImageWidth: 1200,
  ogImageHeight: 630,
} as const;

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

export const openGraphImageUrl = `${siteUrl}/opengraph-image.png`;
export const twitterImageUrl = `${siteUrl}/twitter-image.png`;
