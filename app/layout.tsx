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
      {/* <body className="flex min-h-screen flex-col-reverse md:flex-row">
        <div className="fixed bottom-0 left-0 top-0 h-[102px] w-auto shrink-0 bg-gradient-to-r from-[#5882f2] to-[#0fb8cb] md:h-auto md:w-[102px] md:bg-gradient-to-b"></div>
        <div className="h-full">{children}</div>
      </body> */}
    </html>
  );
}
