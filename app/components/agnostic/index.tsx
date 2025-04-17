"use agnostic";
// Proposes "use agnostic" to enforce an Agnostic Module.

/* IMPORTS */

// Internal imports

import { GlobalAgnosticComponentsName } from "./global";
import { ValidationErrorsAgnosticComponentsName } from "./validation-errors";

/* LOGIC */

export * from "./global";
export * from "./validation-errors";

export type AllLocalAgnosticComponentsName =
  | GlobalAgnosticComponentsName
  | ValidationErrorsAgnosticComponentsName;
