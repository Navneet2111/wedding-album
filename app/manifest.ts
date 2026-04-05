import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Anandi and Vineet's Wedding",
    short_name: "Anandi & Vineet",
    description:
      "Private wedding dashboard, albums, and videos of Anandi and Vineet.",
    start_url: "/",
    display: "standalone",
    background_color: "#2d1513",
    theme_color: "#2d1513",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
