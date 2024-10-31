"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";

import { Button, FallbackFlex } from "@/app/components/__components__";

export default function MomentsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <FallbackFlex>
      <p>Oups. Ça ne devait pas se passer comme ça.</p>
      <Button
        type="button"
        variant="confirm"
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Essayer encore
      </Button>
      <p>Ou essayez simplement de rafraîchir la page.</p>
    </FallbackFlex>
  );
} // https://nextjs.org/docs/canary/app/api-reference/file-conventions/error

/* Notes
All errors go to the GlobalError by default, unless there's an error boundary defined in between. This here now defines the error boundary for every unhandled error, meaning I can safely remove all of my...
// error handling needed eventually
...mentions. // Done.
*/
