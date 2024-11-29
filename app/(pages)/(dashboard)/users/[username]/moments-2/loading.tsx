"use agnostic";

import * as GlobalAgnosticComponents from "@/app/components/agnostic";

export default function Loading() {
  return (
    <GlobalAgnosticComponents.FallbackFlex>
      <p>Loading...</p>
    </GlobalAgnosticComponents.FallbackFlex>
  );
}
