// no directive

/* IMPORTS */

// Components imports

import Core from "./core";
import * as AllGlobalAgnosticComponents from "@/app/components/agnostic";

// Internal imports

import { momentsPageSearchParamsKeys } from "@/app/constants/agnostic/moments";
import { dateToInputDatetime } from "@/app/utilities/agnostic/moments";
import { fetchUserDataFlow } from "@/app/fetches/server/users";
import {
  fetchMomentFormsDataFlow,
  fetchReadMomentsViewDataFlow,
  fetchViewAndMomentDataFlow,
} from "@/app/fetches/server/moments";
import {
  revalidateMomentsServerFlow,
  createOrUpdateMomentServerFlow,
  deleteMomentServerFlow,
} from "@/app/actions/server/serverflows/moments";

// Types imports

import type {
  StepFromClient,
  MomentFormVariant,
  CreateOrUpdateMomentError,
  CreateOrUpdateMomentSuccess,
  MomentAdapted,
} from "@/app/types/agnostic/moments";

/* LOGIC */

export const dynamic = "force-dynamic"; // https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#dynamic

export default async function MomentsPage({
  params,
  searchParams,
}: {
  params: {
    username: string;
  };
  searchParams?: {
    [momentsPageSearchParamsKeys.CONTAINS]?: string;
    [momentsPageSearchParamsKeys.USER_ALL_MOMENTS_PAGE]?: string;
    [momentsPageSearchParamsKeys.USER_PAST_MOMENTS_PAGE]?: string;
    [momentsPageSearchParamsKeys.USER_CURRENT_MOMENTS_PAGE]?: string;
    [momentsPageSearchParamsKeys.USER_FUTURE_MOMENTS_PAGE]?: string;
    [momentsPageSearchParamsKeys.VIEW]?: string;
    [momentsPageSearchParamsKeys.SUB_VIEW]?: string;
    [momentsPageSearchParamsKeys.MOMENT_KEY]?: string;
  };
}) {
  let now = dateToInputDatetime(new Date());
  console.log({ now });

  // PART READ

  // critical

  const { user } = await fetchUserDataFlow(params);

  const { view, moment } = await fetchViewAndMomentDataFlow(searchParams, user);

  // fetches

  const fetchReadMomentsViewData = fetchReadMomentsViewDataFlow(
    now,
    user,
    searchParams,
  );

  const fetchMomentFormsData = fetchMomentFormsDataFlow(user);

  // PART WRITE

  // server functions

  async function createOrUpdateMoment(
    formData: FormData,
    variant: MomentFormVariant,
    startMomentDate: string,
    steps: StepFromClient[],
    momentAdapted: MomentAdapted | undefined,
    destinationSelect: boolean,
    activitySelect: boolean,
  ): Promise<CreateOrUpdateMomentError | CreateOrUpdateMomentSuccess> {
    "use server";

    return await createOrUpdateMomentServerFlow(
      formData,
      variant,
      startMomentDate,
      steps,
      momentAdapted,
      destinationSelect,
      activitySelect,
      user,
    );
  }

  async function deleteMoment(
    momentAdapted: MomentAdapted | undefined,
  ): Promise<CreateOrUpdateMomentError | CreateOrUpdateMomentSuccess> {
    "use server";

    return await deleteMomentServerFlow(momentAdapted, user);
  }

  async function revalidateMoments(): Promise<void> {
    "use server";

    return await revalidateMomentsServerFlow(user);
  }

  return (
    <AllGlobalAgnosticComponents.ErrorBoundarySuspense>
      <Core
        // time (aligned across server and client for hydration cases)
        now={now}
        // critical (user not included due to scope)
        view={view}
        moment={moment}
        // fetches as promises
        fetchReadMomentsViewData={fetchReadMomentsViewData}
        fetchMomentFormsData={fetchMomentFormsData}
        // writes as Server Functions
        revalidateMoments={revalidateMoments}
        createOrUpdateMoment={createOrUpdateMoment}
        deleteMoment={deleteMoment}
      />
    </AllGlobalAgnosticComponents.ErrorBoundarySuspense>
  );
}
