// "use agnostic components";
// Proposes "use agnostic components" to enforce an Agnostic Components Module.

/* IMPORTS */

// Components imports

import * as AllGlobalAgnosticComponents from "@/app/components/agnostic";
import * as AllLocalAgnosticComponents from "./components/agnostic";

// Types imports

import type {
  View,
  MomentAdapted,
  ReadMomentsViewData,
  MomentFormsData,
  CreateOrUpdateMoment,
  DeleteMoment,
  RevalidateMoments,
} from "@/app/types/agnostic/moments";

/* LOGIC */

export default function Core({
  // time
  now,
  // critical
  view,
  moment,
  // fetches as promises
  fetchReadMomentsViewData,
  fetchMomentFormsData,
  // writes as Server Functions
  revalidateMoments,
  createOrUpdateMoment,
  deleteMoment,
}: {
  now: string;
  view: View;
  moment: MomentAdapted | undefined;
  fetchReadMomentsViewData: Promise<ReadMomentsViewData>;
  fetchMomentFormsData: Promise<MomentFormsData>;
  revalidateMoments: RevalidateMoments;
  createOrUpdateMoment: CreateOrUpdateMoment;
  deleteMoment: DeleteMoment;
}) {
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

/* Notes
By default, core.tsx ought to be agnostic. However, it can be enforced as server or client as a choice at while by replacing "use agnostic" with "use server" or "use client components" respectively. 
Or better yet, it can be replaced by "use agnostic adaptive" in order to make Core a Adaptive Component that would conditionally render as a Server Component or a Client Component manually, rather than the way it effectively does by default as an Agnostic Component.
*/
