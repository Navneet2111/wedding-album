import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Anandi and Vineet's Wedding",
    short_name: "Wedding VK",
    description:
      "Private wedding dashboard, albums, and videos of Anandi and Vineet.",
    start_url: "/",
    display: "standalone",
    background_color: "#631214",
    theme_color: "#631214",
    icons: [
      {
        src: "/pwa-icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/pwa-icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
