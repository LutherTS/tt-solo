"use client"; // "use client components"
// Proposes "use client components" to enforce a Client Components Module.

/* IMPORTS */

// External imports

import { useRouter } from "next/navigation";

// Components imports

import * as GlobalAgnosticComponents from "@/app/components/agnostic";
import * as GlobalClientComponents from "@/app/components/client/components";

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
}
