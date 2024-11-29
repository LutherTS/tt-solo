"use agnostic"; // THIS IS A PERSONAL PROPOSAL. CURRENTLY NOT A REAL DIRECTIVE.
// Proposes "use agnostic" to enforce an Agnostic Module.

import * as GlobalAgnosticComponents from "@/app/components/agnostic";

export default function Loading() {
  return (
    <GlobalAgnosticComponents.FallbackFlex>
      <p>Loading...</p>
    </GlobalAgnosticComponents.FallbackFlex>
  );
} // https://nextjs.org/docs/canary/app/api-reference/file-conventions/loading
