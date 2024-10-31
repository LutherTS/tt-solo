import { CRUD } from "./crud";

import * as GlobalServerComponents from "@/app/components/server";
import { HeaderSegment, PageSegment } from "../moments/server";

export default function SettingsPage({
  params,
}: {
  params: {
    username: string;
  };
}) {
  return (
    <>
      <PageSegment>
        <HeaderSegment>
          <GlobalServerComponents.PageTitle title="Mes paramètres" />
        </HeaderSegment>
      </PageSegment>
      <GlobalServerComponents.Divider />
    </>
  );
}
