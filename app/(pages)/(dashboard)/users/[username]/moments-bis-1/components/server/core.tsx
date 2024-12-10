// no directive = server-first. This is a Server Module.

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
