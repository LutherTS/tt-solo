"use agnostic"; // NOT A REAL DIRECTIVE. YET. I HOPE.

import { LocalServerComponentsName } from "./local";
import { DateCardsServerComponentsName } from "./date-cards";

export * from "./local";
export * from "./date-cards";

export type AllLocalServerComponentsName =
  | LocalServerComponentsName
  | DateCardsServerComponentsName;
