// "use agnostic";
// Proposes "use agnostic" to enforce an Agnostic Module.

/* IMPORTS */

// Components imports

import * as AllGlobalIcons from "@/app/icons/agnostic";

/* LOGIC */

export type Option = {
  key: string;
  label: string;
  value: string;
};

export type NavLink = {
  id: string;
  label: string;
  href: string;
  icon: AllGlobalIcons.AllGlobalIconName;
};
