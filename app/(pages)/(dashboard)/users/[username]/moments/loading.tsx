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

/* Notes
This is awesome, loading.tsx acts as a fallback even when notFound() (and I suppose error too) is being triggered.
And that's because it's effectively a pre-rendered React Server Component.
*/
