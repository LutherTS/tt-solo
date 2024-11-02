import * as GlobalServerComponents from "@/app/components/server";

export default function Loading() {
  return (
    <GlobalServerComponents.FallbackFlex>
      <p>Loading...</p>
    </GlobalServerComponents.FallbackFlex>
  );
}
