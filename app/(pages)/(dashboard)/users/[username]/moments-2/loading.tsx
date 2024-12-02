// "use agnostic";
// Proposes "use agnostic" to enforce an Agnostic Module.

import * as GlobalAgnosticComponents from "@/app/components/agnostic";

export default function Loading() {
  return (
    <GlobalAgnosticComponents.FallbackFlex>
      <p>Loading...</p>
    </GlobalAgnosticComponents.FallbackFlex>
  );
}
