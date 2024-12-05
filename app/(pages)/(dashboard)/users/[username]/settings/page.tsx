// "use server"
// Proposes "use server" to enforce a Server Module.

// import { CRUD } from "./crud";

import * as GlobalAgnosticComponents from "@/app/components/agnostic";
import { HeaderSegment, PageSegment } from "../moments/agnostic";

export default function SettingsPage(
  {
    // params,
  }: {
    // params: {
    //   username: string;
    // };
  },
) {
  return (
    <>
      <PageSegment>
        <HeaderSegment>
          <GlobalAgnosticComponents.PageTitle title="Mes paramètres" />
        </HeaderSegment>
      </PageSegment>
      <GlobalAgnosticComponents.Divider />
    </>
  );
}
