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
      <div className="size-full min-h-screen">{children}</div>
    </div>
  );
}

function SideNav({ isFixed }: { isFixed?: boolean }) {
  return (
    <nav>
      <RecursiveSideNav isFixed={isFixed} />
    </nav>
  );
}

function RecursiveSideNav({
  isFixed,
  isInvisible,
}: {
  isFixed?: boolean;
  isInvisible?: boolean;
}) {
  return (
    <>
      {/* SideNavContainer */}
      <div
        className={clsx(
          isFixed && "fixed",
          isInvisible && "invisible",
          // from-blue-500 from-[#5882f2], to-cyan-500 to-[#0fb8cb]
          "z-50 from-[#5882f2] to-[#0fb8cb] p-8",
          "inset-x-0 bottom-0 top-auto shrink-0 bg-gradient-to-r",
          "md:inset-y-0 md:left-0 md:right-auto md:bg-gradient-to-b",
        )}
      >
        <SideNavContents />
      </div>
      {isFixed && <RecursiveSideNav isInvisible />}
    </>
  );
}
