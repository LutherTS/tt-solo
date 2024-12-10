"use agnostic";

/* IMPORTS */

// Internal imports

import { LocalAgnosticComponentsName } from "./local";
import { DateCardsAgnosticComponentsName } from "./date-cards";

/* LOGIC */

export * from "./local";
export * from "./date-cards";

export type AllLocalAgnosticComponentsName =
  | LocalAgnosticComponentsName
  | DateCardsAgnosticComponentsName;
