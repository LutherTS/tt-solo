"use client"; // "use client components"
// Proposes "use client components" to enforce a Client Components Module.

/* IMPORTS */

// Internal imports

import { LocalClientComponentsName } from "./local";
import { ButtonsClientComponentsName } from "./buttons";

/* LOGIC */

export * from "./local";
export * from "./buttons";

export type AllLocalClientComponentsName =
  | LocalClientComponentsName
  | ButtonsClientComponentsName;
