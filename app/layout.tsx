// "use agnostic";
// Proposes "use agnostic" to enforce an Agnostic Module.

/* IMPORTS */

// Internal imports

import "./globals.css";

// Types imports

import type { Metadata } from "next";

/* LOGIC */

export const metadata: Metadata = {
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
// pnpm are I go.
// Updated this bad boy to React 19. // And readying it for React 20.
// About to update to Tailwind CSS v4.
