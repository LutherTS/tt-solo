// "use agnostic";
// Proposes "use agnostic" to enforce an Agnostic Module.

// Indeed I do not have a folder yet for layout Components.
// It's not necessary and can be seen as an alternative implementation.

/* IMPORTS */

// External imports

// import Image from "next/image";
import clsx from "clsx";

// Components imports

import * as LocalClientComponents from "./client";

// Internal imports

import { navLinks } from "@/app/constants/agnostic/globals";

/* LOGIC */

export function SideNav({ isFixed }: { isFixed?: boolean }) {
  return (
    <nav>
      <SideNavRecursive isFixed={isFixed} />
    </nav>
  );
}

export function SideNavRecursive({
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

export function SideNavContainer({
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
        "inset-x-0 bottom-0 top-auto h-32 w-auto bg-linear-to-r",
        "md:inset-y-0 md:left-0 md:right-auto md:h-auto md:w-36 md:bg-linear-to-b",
      )}
    >
      {children}
    </div>
  );
}

export function SideNavContents() {
  return (
    <div
      className={clsx(
        "flex size-full items-center justify-between gap-8",
        "flex-row",
        "md:flex-col",
      )}
    >
      <div
        className={clsx(
          "custom-scrollbar-hiding",
          "flex size-full items-center rounded-sm outline-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
          "flex-row gap-4 overflow-x-auto overflow-y-clip px-2 py-2",
          "md:flex-col md:gap-8 md:overflow-y-auto md:overflow-x-clip md:px-0 md:py-2",
        )}
      >
        {navLinks.map((navLink) => {
          return (
            <div className="p-2" key={navLink.id}>
              <LocalClientComponents.SideNavLink navLink={navLink} />
            </div>
          );
        })}
      </div>
      {/* <div
        className={clsx(
          "relative size-16 shrink-0",
          "mb-0, mr-4",
          "md:mb-4 md:mr-0",
        )}
      >
        <Image
          src="/logo-white.png"
          alt="TekTime logo white"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // default for warning handling
          // https://nextjs.org/docs/pages/api-reference/components/image#sizes
          fill // https://nextjs.org/docs/pages/api-reference/components/image#fill
          priority // https://nextjs.org/docs/pages/api-reference/components/image#priority
        />
      </div> */}
    </div>
  );
}

export function PageWrapper({
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

const localAgnosticComponents = {
  SideNav,
  SideNavRecursive,
  SideNavContainer,
  SideNavContents,
  PageWrapper,
} as const;

export type LocalAgnosticComponentsName = keyof typeof localAgnosticComponents;
