"use client"; // "use client components"
// Proposes "use client components" to enforce a Client Components Module.

import { useRouter } from "next/navigation";

import { Button, FallbackFlex } from "@/app/components/__components__";

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
