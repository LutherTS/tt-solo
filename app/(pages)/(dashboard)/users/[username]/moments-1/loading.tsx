// "use agnostic";
// Proposes "use agnostic" to enforce an Agnostic Module.

/* IMPORTS */

// Components imports

import { FallbackFlex } from "@/app/components/client/components/__components__";

/* LOGIC */

export default function Loading() {
  return (
    <FallbackFlex>
      <p>Loading...</p>
    </FallbackFlex>
  );
}
