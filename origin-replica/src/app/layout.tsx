import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cursor · Origin",
  description: "A git forge for the agentic era.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-US" data-theme="dark" data-origin-dark="true">
      <body>{children}</body>
    </html>
  );
}
