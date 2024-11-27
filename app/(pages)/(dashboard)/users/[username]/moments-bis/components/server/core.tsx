// No directive. Meaning this is a Server Component by default.
// Expectedly as a in a strictly server React Server Component.

// That beings said, core begins usually begins as a client Core component where upgrading from a legacy codebase to a React 19 codebase, before it "evolves" into a server Core. So in another first iteration, a core.tsx file would be made inside the client folder and imported by page.tsx. It is progressively once it would have been updated to be able to render strictly on the server that the file would be moved from the client folder to the server folder, replacing "use client" by no directive.

import * as AllGlobalAgnosticComponents from "@/app/components/agnostic";
import * as AllLocalAgnosticComponents from "../agnostic";

import {
  CreateOrUpdateMoment,
  DeleteMoment,
  FetchMomentFormsData,
  FetchReadMomentsViewData,
  FetchViewAndMomentData,
  RevalidateMoments,
} from "@/app/types/moments";

export default async function Core({
  // time
  now,
  // reads as promises
  fetchViewAndMomentData,
  fetchReadMomentsViewData,
  fetchMomentFormsData,
  // writes
  revalidateMoments,
  createOrUpdateMoment,
  deleteMoment,
}: {
  now: string;
  fetchViewAndMomentData: FetchViewAndMomentData;
  fetchReadMomentsViewData: FetchReadMomentsViewData;
  fetchMomentFormsData: FetchMomentFormsData;
  revalidateMoments: RevalidateMoments;
  createOrUpdateMoment: CreateOrUpdateMoment;
  deleteMoment: DeleteMoment;
}) {
  const { view, moment } = await fetchViewAndMomentData;

  return (
    <>
      <AllLocalAgnosticComponents.Header view={view} />
      <AllGlobalAgnosticComponents.Divider />
      <AllLocalAgnosticComponents.Main
        now={now}
        view={view}
        moment={moment}
        fetchReadMomentsViewData={fetchReadMomentsViewData}
        fetchMomentFormsData={fetchMomentFormsData}
        revalidateMoments={revalidateMoments}
        createOrUpdateMoment={createOrUpdateMoment}
        deleteMoment={deleteMoment}
      />
    </>
  );
}
