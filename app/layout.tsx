import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TekTIME solo",
  description: "My TekTIME demo, now with a database",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // <html lang="en">
    <html lang="fr">
      <body className="bg-teal-50">{children}</body>
    </html>
  );
}

// Next.js 15, here I come.
