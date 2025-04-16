"use client";
// Proposes "use client" to enforce a Client Module.

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
