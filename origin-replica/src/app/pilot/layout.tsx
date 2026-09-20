import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "After Class Pilot",
  robots: { index: false, follow: false },
};

export default function PilotLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
