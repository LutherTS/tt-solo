"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import clsx from "clsx";

import * as Icons from "@/app/icons";

const navLinks: {
  id: number;
  label: string;
  href: string;
  icon: Icons.IconName;
}[] = [
  // {
  //   id: 0,
  //   label: "Paramètres",
  //   href: "/settings",
  //   icon: "Cog8ToothOutline",
  // },
  {
    id: 1,
    label: "Moments",
    href: "/moments",
    icon: "CalendarDaysOutline",
  },
  // {
  //   id: 2,
  //   label: "Destinations",
  //   href: "/destinations",
  //   icon: "PaperAirplaneOutline",
  // },
];

export function SideNavContents() {
  const pathname = usePathname();
  const path = pathname.split("/").slice(0, 3).join("/");

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
        {navLinks.map((navLink) => {
          const Icon = Icons[navLink.icon];

          return (
            <div className="p-2" key={navLink.id}>
              <Link
                href={path + navLink.href}
                className={`flex flex-col items-center justify-between gap-2 rounded outline-none focus-visible:outline-2 focus-visible:outline-offset-8 ${pathname === path + navLink.href ? "focus-visible:outline-cyan-950" : "focus-visible:outline-white"}`}
              >
                <div className="flex size-10 items-center justify-center rounded-full">
                  <Icon
                    className={`size-10 ${pathname === path + navLink.href ? "text-cyan-950" : "text-white"}`}
                  />
                </div>
                <p
                  className={`text-xs leading-none transition-all ${pathname === path + navLink.href ? "text-cyan-950" : "text-white"}`}
                >
                  {navLink.label}
                </p>
              </Link>
            </div>
          );
        })}
      </div>
      <div
        className={clsx(
          "relative size-16 flex-shrink-0",
          "mb-0, mr-4",
          "md:mb-4 md:mr-0",
        )}
      >
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
The component file logic is going to be: if you see me go out of my way to make a colocated component file, that means I had to because it's a client component. Therefore, all colocated component files are client components.
*/
