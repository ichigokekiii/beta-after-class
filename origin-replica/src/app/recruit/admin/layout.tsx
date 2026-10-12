import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recruit admin",
  robots: { index: false, follow: false },
};

export default function RecruitAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
