"use client";
// Enforces a Client Module.

import { GlobalClientComponentsName } from "./global";
import { InputsClientComponentsName } from "./inputs";

export * from "./global";
export * from "./inputs";

export type AllLocalClientComponentsName =
  | GlobalClientComponentsName
  | InputsClientComponentsName;
