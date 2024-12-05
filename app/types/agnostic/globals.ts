// "use agnostic";
// Proposes "use agnostic" to enforce an Agnostic Module.

import * as AllGlobalIcons from "@/app/icons/agnostic";

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
