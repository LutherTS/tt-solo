export default function Loading() {
  // Or a custom loading skeleton component
  return (
    // no look at the styles, this is really just a placeholder
    <div className="flex h-[calc(100vh_-_5rem)] flex-col items-center justify-center">
      <div className="space-y-4 text-center">
        <p>Loading...</p>
      </div>
    </div>
  );
} // https://nextjs.org/docs/canary/app/api-reference/file-conventions/loading

/* Notes
This is awesome, loading.tsx acts as a fallback even when notFound() (and I suppose error too) is being triggered.
And that's because it's effectively a pre-rendered React Server Component.
*/
