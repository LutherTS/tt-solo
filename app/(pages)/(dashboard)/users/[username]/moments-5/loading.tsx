import * as GlobalServerComponents from "@/app/components/agnostic";

export default function Loading() {
  return (
    <GlobalServerComponents.FallbackFlex>
      <p>Loading...</p>
    </GlobalServerComponents.FallbackFlex>
  );
} // https://nextjs.org/docs/canary/app/api-reference/file-conventions/loading
