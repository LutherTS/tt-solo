"use agnostic"; // NOT A REAL DIRECTIVE. YET. I HOPE.

import { GlobalAgnosticComponentsName } from "./global";
import { ValidationErrorsAgnosticComponentsName } from "./validation-errors";

export * from "./global";
export * from "./validation-errors";

export type AllLocalAgnosticComponentsName =
  | GlobalAgnosticComponentsName
  | ValidationErrorsAgnosticComponentsName;
