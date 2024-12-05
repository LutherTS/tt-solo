"use client"; // "use client components"
// Proposes "use client components" to enforce a Client Components Module.

import { GlobalClientComponentsName } from "./global";
import { InputsClientComponentsName } from "./inputs";

export * from "./global";
export * from "./inputs";

export type AllLocalClientComponentsName =
  | GlobalClientComponentsName
  | InputsClientComponentsName;
