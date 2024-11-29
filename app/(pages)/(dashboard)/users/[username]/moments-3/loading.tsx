"use agnostic";

import * as GlobalAgnosticComponents from "@/app/components/agnostic";

export default function Loading() {
  // Or a custom loading skeleton component
  return (
    <GlobalAgnosticComponents.FallbackFlex>
      <p>Loading...</p>
    </GlobalAgnosticComponents.FallbackFlex>
  );
} // https://nextjs.org/docs/canary/app/api-reference/file-conventions/loading
