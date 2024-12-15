// "use agnostic";
// Proposes "use agnostic" to enforce an Agnostic Module.

/* IMPORTS */

// External imports

import clsx from "clsx";

// Components imports

import * as LocalAgnosticComponents from "./agnostic";

/* LOGIC */

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={clsx("flex min-h-screen", "flex-col-reverse", "md:flex-row")}
    >
      <LocalAgnosticComponents.SideNav isFixed />
      <LocalAgnosticComponents.PageWrapper>
        {children}
      </LocalAgnosticComponents.PageWrapper>
    </div>
  );
}
