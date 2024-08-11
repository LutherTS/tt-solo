"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import clsx from "clsx";

const navLinks = [
  {
    id: 0,
    label: "Paramètres",
    href: "/settings",
  },
  {
    id: 1,
    label: "Moments",
    href: "/moments",
  },
  {
    id: 2,
    label: "Destinations",
    href: "/destinations",
  },
];

export function SideNavContents() {
  const pathname = usePathname();

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
          "flex size-full items-center rounded outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
          "flex-row gap-4 overflow-x-auto overflow-y-clip px-2 py-2",
          "md:flex-col md:gap-8 md:overflow-y-auto md:overflow-x-clip md:px-0 md:py-2",
        )}
      >
        {navLinks.map((navLink) => (
          <div className="p-2" key={navLink.id}>
            <Link
              href={navLink.href}
              className={`flex flex-col items-center justify-between gap-2 rounded outline-none focus-visible:outline-2 focus-visible:outline-offset-8 ${pathname === navLink.href ? "focus-visible:outline-cyan-950" : "focus-visible:outline-white"}`}
            >
              <div className="size-10 rounded-full bg-neutral-500"></div>
              <p
                className={`text-xs leading-none transition-all ${pathname === navLink.href ? "text-cyan-950" : "text-white"}`}
              >
                {navLink.label}
              </p>
            </Link>
          </div>
        ))}
      </div>
      <div className="relative size-16 flex-shrink-0">
        <Image
          src="/logo-white.png"
          alt="TekTime logo white"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // default for warning handling
          // https://nextjs.org/docs/pages/api-reference/components/image#sizes
          fill
        />
      </div>
    </div>
  );
}

/* Notes
The component file logic is going to be: if you see me go out of my way to make a colocated component file, it's because I had to because it's a client component. Therefore, all colocated component files are client components.
*/
