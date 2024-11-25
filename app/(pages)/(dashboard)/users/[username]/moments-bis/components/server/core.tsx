// No directive. core.tsx here is meant to be a strict RSC, what I call and what should be called a Server Component.

// That beings said, core begins as a Client Core before it evolves into a Server Core, so in another first iteration, it will have the "use client" directive, inside the client folder.

import * as GlobalAgnosticComponents from "@/app/components/agnostic";

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
      <GlobalAgnosticComponents.Divider />
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
