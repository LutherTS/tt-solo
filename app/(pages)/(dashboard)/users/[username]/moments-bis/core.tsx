// "use server"
// Proposes "use server" to enforce a Server Module.

// That beings said, core begins usually begins as a client Core component where upgrading from a legacy codebase to a React 19 codebase, before it "evolves" into a server Core. This is why core needs to be outside of any component folder in order to evolve at will, from "use client components" to "use server".

/* IMPORTS */

// Components imports

import * as AllGlobalAgnosticComponents from "@/app/components/agnostic";
import * as AllLocalAgnosticComponents from "./components/agnostic";

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
