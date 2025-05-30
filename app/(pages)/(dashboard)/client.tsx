"use client"; // "use client components"
// Proposes "use client components" to enforce a Client Components Module.

/* IMPORTS */

// External imports

import Link from "next/link";
import { usePathname } from "next/navigation";

// Components imports

import * as AllGlobalIcons from "@/app/icons/agnostic";

// Internal imports

import { NavLink } from "@/app/types/agnostic/globals";

/* LOGIC */

export function SideNavLink({ navLink }: { navLink: NavLink }) {
  const Icon = AllGlobalIcons[navLink.icon];
  const pathname = usePathname();
  const path = pathname.split("/").slice(0, 3).join("/");

  return (
    <Link
      href={path + navLink.href}
      className={`flex flex-col items-center justify-between gap-2 rounded-sm outline-hidden focus-visible:outline-2 focus-visible:outline-offset-8 ${pathname === path + navLink.href ? "focus-visible:outline-cyan-950" : "focus-visible:outline-white"}`}
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
  );
}

const localClientComponents = {
  SideNavLink,
} as const;

export type LocalClientComponentsName = keyof typeof localClientComponents;
