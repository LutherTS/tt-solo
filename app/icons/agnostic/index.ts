// "use agnostic";
// Proposes "use agnostic" to enforce an Agnostic Module.

// ALL ICONS ARE MEANT TO BE AGNOSTIC.
// Which explains why the icons folder does not have child agnostic, client or server folders.
// ...I still need Icon at the end of the Icon names because the namespace does not show in the React Dev Tools. Basically if imported anywhere as is, the name needs to explicitly say that this an icon.

/* IMPORTS */

// Internal imports

import { GlobalIconName } from "./global";
import { NavigationIconName } from "./navigation";

/* LOGIC */

export * from "./global";
export * from "./navigation";

export type AllGlobalIconName = GlobalIconName | NavigationIconName;
