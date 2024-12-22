// no directive too

/* IMPORTS */

// External imports

// import * as fs from "node:fs"; // to prove this is not a Server Module
// fs.readdirSync("/"); // this is a NOT imported as a Server Module, so it will throw an error

// Internal imports

import { LocalAgnosticComponentsName } from "./local";
import { DateCardsAgnosticComponentsName } from "./date-cards";

/* LOGIC */

export * from "./local";
export * from "./date-cards";

export type AllLocalAgnosticComponentsName =
  | LocalAgnosticComponentsName
  | DateCardsAgnosticComponentsName;
