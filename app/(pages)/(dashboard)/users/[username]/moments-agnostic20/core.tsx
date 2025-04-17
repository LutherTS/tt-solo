"use agnostic";
// Proposes "use agnostic" to enforce an Agnostic Module.

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
