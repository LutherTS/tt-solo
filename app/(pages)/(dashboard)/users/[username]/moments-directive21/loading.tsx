// "use agnostic components";
// Proposes "use agnostic components" to enforce an Agnostic Components Module.

/* IMPORTS */

// Components imports

import * as GlobalAgnosticComponents from "@/app/components/agnostic";

/* LOGIC */

export default function Loading() {
  return (
    <GlobalAgnosticComponents.FallbackFlex>
      <p>Loading...</p>
    </GlobalAgnosticComponents.FallbackFlex>
  );
} // https://nextjs.org/docs/canary/app/api-reference/file-conventions/loading
