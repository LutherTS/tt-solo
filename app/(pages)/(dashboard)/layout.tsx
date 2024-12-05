// "use agnostic";
// Proposes "use agnostic" to enforce an Agnostic Module.

import clsx from "clsx";

import * as LocalAgnosticComponents from "./agnostic";

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
      <LocalAgnosticComponents.Page>{children}</LocalAgnosticComponents.Page>
    </div>
  );
}
