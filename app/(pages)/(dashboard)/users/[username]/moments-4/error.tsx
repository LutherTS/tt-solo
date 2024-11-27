"use client";

import { useEffect } from "react";

import * as GlobalServerComponents from "@/app/components/agnostic";
import * as GlobalClientComponents from "@/app/components/client";

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
    <GlobalServerComponents.FallbackFlex>
      <p>Oups. Ça ne devait pas se passer comme ça.</p>
      <GlobalClientComponents.Button
        type="button"
        variant="confirm"
        onClick={() => reset()}
      >
        Essayer encore
      </GlobalClientComponents.Button>
      <p>Ou essayez simplement de rafraîchir la page.</p>
    </GlobalServerComponents.FallbackFlex>
  );
} // https://nextjs.org/docs/canary/app/api-reference/file-conventions/error
