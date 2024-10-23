import clsx from "clsx";

import { SideNavContents } from "./sidenav-contents";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={clsx("flex min-h-screen", "flex-col-reverse", "md:flex-row")}
    >
      <SideNav isFixed />
      <Page>{children}</Page>
    </div>
  );
}

function SideNav({ isFixed }: { isFixed?: boolean }) {
  return (
    <nav>
      <SideNavRecursive isFixed={isFixed} />
    </nav>
  );
}

function SideNavRecursive({
  isFixed,
  isInvisible,
}: {
  isFixed?: boolean;
  isInvisible?: boolean;
}) {
  return (
    <>
      <SideNavContainer isFixed={isFixed} isInvisible={isInvisible}>
        <SideNavContents />
      </SideNavContainer>
      {isFixed && <SideNavRecursive isInvisible />}
    </>
  );
}

function SideNavContainer({
  isFixed,
  isInvisible,
  children,
}: Readonly<{
  isFixed?: boolean;
  isInvisible?: boolean;
  children: React.ReactNode;
}>) {
  return (
    <div
      className={clsx(
        isFixed && "fixed",
        isInvisible && "invisible",
        "z-50 shrink-0 from-[#5882f2] to-[#0fb8cb] p-4",
        "inset-x-0 bottom-0 top-auto h-32 w-auto bg-gradient-to-r",
        "md:inset-y-0 md:left-0 md:right-auto md:h-auto md:w-36 md:bg-gradient-to-b",
      )}
    >
      {children}
    </div>
  );
}

function Page({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={clsx(
        "min-h-screen",
        "overflow-clip", // affects the divider
        "flex w-screen flex-col", // affects error pages, etc.
      )}
    >
      {children}
    </div>
  );
}
