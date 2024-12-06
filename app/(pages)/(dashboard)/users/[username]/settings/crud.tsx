// "use agnostic";
// Proposes "use agnostic" to enforce an Agnostic Module.

/* IMPORTS */

// Components imports

import { PageTitle } from "@/app/components/client/components/__components__";

/* LOGIC */

export function CRUD() {
  return (
    <>
      <div className="space-y-8">
        <div className="flex justify-between align-baseline">
          <PageTitle title="Vos paramètres" />
        </div>
      </div>
    </>
  );
}
