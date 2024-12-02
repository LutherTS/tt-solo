// "use server"
// Proposes "use server" to enforce a Server Module.

import { notFound } from "next/navigation";

import * as GlobalServerComponents from "@/app/components/agnostic";
import Core from "./server";
import {
  StepFromClient,
  MomentFormVariant,
  CreateOrUpdateMomentError,
  CreateOrUpdateMomentSuccess,
  MomentAdapted,
} from "@/app/types/moments";
import { dateToInputDatetime } from "@/app/utilities/moments";
import { momentsPageSearchParamsKeys } from "@/app/constants/moments";
import { findUserIdByUsername } from "@/app/reads/users";
import {
  revalidateMomentsServerFlow,
  createOrUpdateMomentServerFlow,
  deleteMomentServerFlow,
} from "@/app/flows/server/moments";
import {
  fetchMomentFormsDataFlow,
  fetchReadMomentsViewDataFlow,
  fetchViewAndMomentDataFlow,
} from "@/app/flows/fetch/moments";

export const dynamic = "force-dynamic";
// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#dynamic // still sometimes it says static route...

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
    // now lifted to the URL
    [momentsPageSearchParamsKeys.VIEW]?: string;
    [momentsPageSearchParamsKeys.SUB_VIEW]?: string;
    [momentsPageSearchParamsKeys.MOMENT_KEY]?: string;
  };
}) {
  // VERY IMPORTANT. PREFER DATE AS A STRING TO AVOID TIMEZONE ISSUES, and in the input datetime-local format to easily interact with forms.
  let now = dateToInputDatetime(new Date());
  console.log({ now });

  // PART READ (a.k.a database calls)

  params = await params;

  const username = params.username;
  // console.log({ username });

  const userFound = await findUserIdByUsername(username);
  // console.log({ userFound });

  if (!userFound) return notFound();

  // extremely important in order to use user in server actions without null
  const user = userFound;

  // fetches

  const fetchViewAndMomentData = fetchViewAndMomentDataFlow(searchParams, user);

  // first directly resolved on the server at this time
  // const viewAndMomentData = await fetchViewAndMomentData;

  const fetchReadMomentsViewData = fetchReadMomentsViewDataFlow(
    now,
    user,
    searchParams,
  );

  // first directly resolved on the server at this time
  // const readMomentsViewData = await fetchReadMomentsViewData;

  const fetchMomentFormsData = fetchMomentFormsDataFlow(user);

  // first directly resolved on the server at this time
  // const momentFormsData = await fetchMomentFormsData;

  // even faster
  const [viewAndMomentData, readMomentsViewData, momentFormsData] =
    await Promise.all([
      fetchViewAndMomentData,
      fetchReadMomentsViewData,
      fetchMomentFormsData,
    ]);

  // PART WRITE (a.k.a. server actions)

  async function createOrUpdateMoment(
    formData: FormData,
    variant: MomentFormVariant,
    startMomentDate: string,
    steps: StepFromClient[],
    momentAdapted: MomentAdapted | undefined,
    destinationSelect: boolean,
    activitySelect: boolean,
  ): Promise<CreateOrUpdateMomentError | CreateOrUpdateMomentSuccess> {
    "use server"; // "use server functions"
    // Proposes "use server functions" to enforce a Server Fonction.
    // On top of modules, "use server functions" would enforce a Server Functions Module.

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
    "use server"; // "use server functions"
    // Proposes "use server functions" to enforce a Server Fonction.

    return await deleteMomentServerFlow(momentAdapted, user);
  }

  async function revalidateMoments(): Promise<void> {
    "use server"; // "use server functions"
    // Proposes "use server functions" to enforce a Server Fonction.

    return await revalidateMomentsServerFlow(user);
  }

  return (
    <GlobalServerComponents.ErrorBoundarySuspense>
      <Core
        // time (aligned across server and client for hydration cases)
        now={now}
        // reads
        viewAndMomentData={viewAndMomentData}
        readMomentsViewData={readMomentsViewData}
        momentFormsData={momentFormsData}
        // writes
        revalidateMoments={revalidateMoments}
        createOrUpdateMoment={createOrUpdateMoment}
        deleteMoment={deleteMoment}
      />
    </GlobalServerComponents.ErrorBoundarySuspense>
  );
}
