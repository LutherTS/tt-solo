"use client";
// Proposes "use client" to enforce a Client Module.

/* IMPORTS */

// External imports

import { useRouter } from "next/navigation";

// Components imports

import * as GlobalAgnosticComponents from "@/app/components/agnostic";
import * as GlobalClientComponents from "@/app/components/client";

/* LOGIC */

export default function NotFound() {
  const { back } = useRouter();

  return (
    <GlobalAgnosticComponents.FallbackFlex>
      <p>Mince. Il n'y a personne.</p>
      <p>L'utilisateur demandé n'a pas été trouvé en base de données.</p>
      <GlobalClientComponents.Button
        type="button"
        variant="confirm"
        onClick={() => back()}
      >
        Revenir en arrière
      </GlobalClientComponents.Button>
    </GlobalAgnosticComponents.FallbackFlex>
  );
} // https://nextjs.org/docs/canary/app/api-reference/file-conventions/not-found
