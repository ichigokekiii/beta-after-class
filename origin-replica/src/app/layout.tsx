import type { Metadata } from "next";
import "./globals.css";
// MapLibre base styles for the panning background
import "maplibre-gl/dist/maplibre-gl.css";

export const metadata: Metadata = {
  title: "After Class",
  description: "The first move is showing up.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-US" data-theme="dark" data-origin-dark="true">
      <head>
        <link
          rel="preload"
          href="/fonts/CursorGothic-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
