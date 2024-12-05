"use client"; // "use client components"
// Proposes "use client components" to enforce a Client Components Module.

import { LocalClientComponentsName } from "./local";
import { ButtonsClientComponentsName } from "./buttons";

export * from "./local";
export * from "./buttons";

export type AllLocalClientComponentsName =
  | LocalClientComponentsName
  | ButtonsClientComponentsName;
