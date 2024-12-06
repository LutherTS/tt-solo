"use client"; // "use client components"
// Proposes "use client components" to enforce a Client Components Module.

/* IMPORTS */

// External imports

import { useRouter } from "next/navigation";

// Components imports

import {
  Button,
  FallbackFlex,
} from "@/app/components/client/components/__components__";

/* LOGIC */

export default function NotFound() {
  const { back } = useRouter();

  return (
    <FallbackFlex>
      <p>Mince. Il n'y a personne.</p>
      <p>L'utilisateur demandé n'a pas été trouvé en base de données.</p>
      <Button type="button" variant="confirm" onClick={() => back()}>
        Revenir en arrière
      </Button>
    </FallbackFlex>
  );
}
