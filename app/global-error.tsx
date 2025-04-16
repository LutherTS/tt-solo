"use client";
// Proposes "use client" to enforce a Client Module.

// Error boundaries must be Client Components

/* IMPORTS */

// External imports

import { useEffect } from "react";

// Internal imports

import * as GlobalAgnosticComponents from "@/app/components/agnostic";
import * as GlobalClientComponents from "@/app/components/client";

/* LOGIC */

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
    <html>
      <body>
        <GlobalAgnosticComponents.FallbackFlex>
          <p>Oups. Ça ne devait pas DU TOUT se passer comme ça.</p>
          <GlobalClientComponents.Button
            type="button"
            variant="confirm"
            onClick={
              // Attempt to recover by trying to re-render the segment
              () => reset()
            }
          >
            Essayer encore
          </GlobalClientComponents.Button>
          <p>Ou essayez simplement de rafraîchir la page.</p>
          <p>Mais à ce niveau c'est sûrement un TRÈS gros problème interne.</p>
        </GlobalAgnosticComponents.FallbackFlex>
      </body>
    </html>
  );
} // https://nextjs.org/docs/app/api-reference/file-conventions/error#global-errorjs
