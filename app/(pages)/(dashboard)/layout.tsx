import clsx from "clsx";

import * as LocalServerComponents from "./server";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={clsx("flex min-h-screen", "flex-col-reverse", "md:flex-row")}
    >
      <LocalServerComponents.SideNav isFixed />
      <LocalServerComponents.Page>{children}</LocalServerComponents.Page>
    </div>
  );
}
