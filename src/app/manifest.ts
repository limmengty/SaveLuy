import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SaveLuy — Know what you can safely spend today.",
    short_name: "SaveLuy",
    id: "saveluy-pwa-v1",
    description: "A calm daily spending decision system with instant capture and purchase impact checking.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b0f17",
    theme_color: "#10b981",
    orientation: "portrait",
    categories: ["finance", "lifestyle", "productivity"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
