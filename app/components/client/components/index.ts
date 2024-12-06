"use client"; // "use client components"
// Proposes "use client components" to enforce a Client Components Module.

/* IMPORTS */

// Internal imports

import { GlobalClientComponentsName } from "./global";
import { InputsClientComponentsName } from "./inputs";

/* LOGIC */

export * from "./global";
export * from "./inputs";

export type AllLocalClientComponentsName =
  | GlobalClientComponentsName
  | InputsClientComponentsName;
