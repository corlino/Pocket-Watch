import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pocket Watch",
    short_name: "Pocket Watch",
    description: "Personal finance and budgeting.",
    start_url: "/home",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#082f32",
    theme_color: "#082f32",
    icons: [
      { src: "/manifest-icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/manifest-icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/manifest-icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
