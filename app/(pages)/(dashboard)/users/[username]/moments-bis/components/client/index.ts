"use client";
// Enforces a Client Module.

import { LocalClientComponentsName } from "./local";
import { ButtonsClientComponentsName } from "./buttons";

export * from "./local";
export * from "./buttons";

export type AllLocalClientComponentsName =
  | LocalClientComponentsName
  | ButtonsClientComponentsName;
