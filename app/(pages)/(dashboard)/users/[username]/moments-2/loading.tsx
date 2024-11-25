import * as GlobalServerComponents from "@/app/components/agnostic";

export default function Loading() {
  return (
    <GlobalServerComponents.FallbackFlex>
      <p>Loading...</p>
    </GlobalServerComponents.FallbackFlex>
  );
}
