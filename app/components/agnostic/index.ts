"use agnostic"; // NOT A REAL DIRECTIVE. YET. I HOPE.

import { GlobalAgnosticComponentsName } from "./global";

export * from "./global";

export type AllLocalAgnosticComponentsName = GlobalAgnosticComponentsName;
