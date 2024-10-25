"use client";

import { useRouter } from "next/navigation";

import * as GlobalClientComponents from "@/app/components/client";

export default function NotFound() {
  const { back } = useRouter();

  return (
    // no look at the styles, this is really just a placeholder
    <div className="flex h-[calc(100vh_-_5rem)] flex-col items-center justify-center">
      <div className="space-y-4 text-center">
        <p>Mince. Il n'y a personne.</p>
        <p>L'utilisateur demandé n'a pas été trouvé en base de données.</p>
        <GlobalClientComponents.Button
          type="button"
          variant="confirm"
          onClick={() => back()}
        >
          Revenir en arrière
        </GlobalClientComponents.Button>
      </div>
    </div>
  );
} // https://nextjs.org/docs/canary/app/api-reference/file-conventions/not-found

/* Notes
There's a bit of a jump to a white screen at rendering... But perhaps I can fix it with a loading.tsx at the moments folder level. // Yup.
Also, I hear a notAuthenticated() page is also in the works. https://www.youtube.com/watch?v=-FMwdg2wx4M
If I need to specify my notFound based on the params or the searchParams I can always useParams or useSeachParams right here.
https://nextjs.org/docs/canary/app/api-reference/functions/use-params
https://nextjs.org/docs/canary/app/api-reference/functions/use-search-params
*/
