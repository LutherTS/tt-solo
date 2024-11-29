// "use agnostic";
// Proposes "use agnostic" to enforce an Agnostic Module.

import { GlobalAgnosticComponentsName } from "./global";
import { ValidationErrorsAgnosticComponentsName } from "./validation-errors";

export * from "./global";
export * from "./validation-errors";

export type AllLocalAgnosticComponentsName =
  | GlobalAgnosticComponentsName
  | ValidationErrorsAgnosticComponentsName;
