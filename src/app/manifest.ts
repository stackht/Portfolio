import type { MetadataRoute } from "next"

export const dynamic = "force-static"

// Lets Android and other mobile browsers pick a full-size icon (tab switcher, home screen).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Hemant Thakur",
    short_name: "Hemant",
    description: "Computer Engineering student building across the stack.",
    start_url: "/",
    display: "browser",
    background_color: "#f3f4f6",
    theme_color: "#f3f4f6",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  }
}
