import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join the After Class team",
  robots: { index: false, follow: false },
};

export default function RecruitLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
