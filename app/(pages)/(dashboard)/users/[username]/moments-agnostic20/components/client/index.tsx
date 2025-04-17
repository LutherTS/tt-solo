"use client";
// Proposes "use client" to enforce a Client Module.

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
