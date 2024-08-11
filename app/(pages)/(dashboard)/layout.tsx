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
      {/* min-h-screen unnecessary */}
      <div className="size-full">
        {/* Page Wrapper */}
        {/* w-full replacing w-screen with w-full from CRUD main */}
        <main className="flex w-full flex-col items-center">
          {/* Page Container */}
          <div
            className={clsx(
              "min-h-screen w-full max-w-4xl space-y-8 overflow-clip px-8 pt-8",
              "pb-12",
              "md:pb-24",
            )}
          >
            {/* Page Contents */}
            {children}
          </div>
        </main>
      </div>
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
          "z-50 shrink-0 from-[#5882f2] to-[#0fb8cb] p-4",
          "inset-x-0 bottom-0 top-auto h-32 w-auto bg-gradient-to-r",
          "md:inset-y-0 md:left-0 md:right-auto md:h-auto md:w-36 md:bg-gradient-to-b",
        )}
      >
        <SideNavContents />
      </div>
      {isFixed && <RecursiveSideNav isInvisible />}
    </>
  );
}