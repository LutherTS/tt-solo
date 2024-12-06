"use client"; // "use client components"
// Proposes "use client components" to enforce a Client Components Module.

/* IMPORTS */

// External imports

import { useEffect } from "react";

// Components imports

import {
  Button,
  FallbackFlex,
} from "@/app/components/client/components/__components__";

/* LOGIC */

export default function MomentsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <FallbackFlex>
      <p>Oups. Ça ne devait pas se passer comme ça.</p>
      <Button type="button" variant="confirm" onClick={() => reset()}>
        Essayer encore
      </Button>
      <p>Ou essayez simplement de rafraîchir la page.</p>
    </FallbackFlex>
  );
}
