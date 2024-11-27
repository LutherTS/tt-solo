import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  // title: "TekTIME solo",
  // description: "My TekTIME demo, now with a database",
  title: "React Paris Meetup demo",
  description: "Incrementally adopting React 19 (via Next.js 15)",
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

// Next.js 15, here I am. // And readying for Next.js 16.
