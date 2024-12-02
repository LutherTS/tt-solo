"use client";
// Enforces a Client Module.

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
