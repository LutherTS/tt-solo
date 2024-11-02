"use client";

import { useRouter } from "next/navigation";

import * as GlobalServerComponents from "@/app/components/server";
import * as GlobalClientComponents from "@/app/components/client";

export default function NotFound() {
  const { back } = useRouter();

  return (
    <GlobalServerComponents.FallbackFlex>
      <p>Mince. Il n'y a personne.</p>
      <p>L'utilisateur demandé n'a pas été trouvé en base de données.</p>
      <GlobalClientComponents.Button
        type="button"
        variant="confirm"
        onClick={() => back()}
      >
        Revenir en arrière
      </GlobalClientComponents.Button>
    </GlobalServerComponents.FallbackFlex>
  );
}
