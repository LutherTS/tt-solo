export default function Loading() {
  // Or a custom loading skeleton component
  return (
    <div className="flex h-[calc(100vh_-_5rem)] flex-col items-center justify-center space-y-4">
      <p>Loading...</p>
    </div>
  );
} // https://nextjs.org/docs/canary/app/api-reference/file-conventions/loading

/* Notes
This is awesome, loading.tsx acts as a fallback even when notFound() (and I suppose error too) is being triggered.
*/
