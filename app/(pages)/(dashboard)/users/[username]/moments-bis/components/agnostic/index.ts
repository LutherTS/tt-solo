// "use agnostic";
// Proposes "use agnostic" to enforce an Agnostic Module.

import { LocalAgnosticComponentsName } from "./local";
import { DateCardsAgnosticComponentsName } from "./date-cards";

export * from "./local";
export * from "./date-cards";

export type AllLocalAgnosticComponentsName =
  | LocalAgnosticComponentsName
  | DateCardsAgnosticComponentsName;
