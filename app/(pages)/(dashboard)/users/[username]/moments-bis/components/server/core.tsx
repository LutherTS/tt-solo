// "use server"
// Proposes "use server" to enforce a Server Module.

// That beings said, core begins usually begins as a client Core component where upgrading from a legacy codebase to a React 19 codebase, before it "evolves" into a server Core. So in another first iteration, a core.tsx file would be made inside the client folder and imported by page.tsx. It is progressively once it would have been updated to be able to render strictly on the server that the file would be moved from the client folder to the server folder, replacing "use client" by a new "use server".

/* IMPORTS */

// Components imports

import * as AllGlobalAgnosticComponents from "@/app/components/agnostic";
import * as AllLocalAgnosticComponents from "../agnostic";

// Types imports

import type {
  CreateOrUpdateMoment,
  DeleteMoment,
  MomentFormsData,
  ReadMomentsViewData,
  ViewAndMomentData,
  RevalidateMoments,
} from "@/app/types/agnostic/moments";

/* LOGIC */

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
  fetchViewAndMomentData: Promise<ViewAndMomentData>;
  fetchReadMomentsViewData: Promise<ReadMomentsViewData>;
  fetchMomentFormsData: Promise<MomentFormsData>;
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
