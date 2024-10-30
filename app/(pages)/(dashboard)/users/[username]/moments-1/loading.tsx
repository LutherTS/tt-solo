import { FallbackFlex } from "@/app/components_old";

export default function Loading() {
  // Or a custom loading skeleton component
  return (
    <FallbackFlex>
      <p>Loading...</p>
    </FallbackFlex>
  );
} // https://nextjs.org/docs/canary/app/api-reference/file-conventions/loading

/* Notes
This is awesome, loading.tsx acts as a fallback even when notFound() (and I suppose error too) is being triggered.
And that's because it's effectively a pre-rendered React Server Component.
*/
