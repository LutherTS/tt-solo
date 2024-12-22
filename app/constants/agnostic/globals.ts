// "use agnostic";
// Proposes "use agnostic" to enforce an Agnostic Module.

/* IMPORTS */

// External imports

import clsx from "clsx";

// Types imports

import type { NavLink } from "@/app/types/agnostic/globals";

/* LOGIC */

// Grouped style classes

// temporarily change variable name to className for Intellisense
// (or add it to "tailwindCSS.classAttributes" in VSCode settings)
// wrap variable string with clsx() for Prettier sorting
// or in a tw template literal // .prettierrc – "tailwindFunctions": ["tw"]

// border-[#e5e7eb] is the browser's default for border color if needed
export const baseInputTexts = clsx(
  "rounded border-2 border-[#e5e7eb] bg-white transition-colors duration-0 hover:border-neutral-100 hover:duration-150",
);

export const notDatetimeLocalPadding = clsx("px-3 py-2");

export const textareaPadding = clsx("px-3 py-3");

export const focusVisibleTexts = clsx(
  "focus-visible:border-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500",
);

// Nav links

export const navLinks: NavLink[] = [
  {
    id: "Paramètres",
    label: "Paramètres",
    href: "/settings",
    icon: "Cog8ToothOutlineIcon",
  },
  {
    id: "Moments",
    label: "Moments",
    href: "/moments-bis-5",
    icon: "CalendarDaysOutlineIcon",
  },
  {
    id: "Destinations",
    label: "Destinations",
    href: "/destinations",
    icon: "PaperAirplaneOutlineIcon",
  },
];
