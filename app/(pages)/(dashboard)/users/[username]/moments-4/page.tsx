import { notFound } from "next/navigation";

import * as GlobalServerComponents from "@/app/components/server";
import Core from "./server";
import {
  StepFromClient,
  MomentFormVariant,
  CreateOrUpdateMomentError,
  CreateOrUpdateMomentSuccess,
  MomentAdapted,
} from "@/app/types/moments";
import { dateToInputDatetime } from "@/app/utilities/moments";
import {
  CONTAINS,
  CURRENTUSERMOMENTSPAGE,
  FUTUREUSERMOMENTSPAGE,
  MOMENTKEY,
  PASTUSERMOMENTSPAGE,
  SUBVIEW,
  USERMOMENTSPAGE,
  VIEW,
} from "@/app/data/moments";
import { findUserIdByUsername } from "@/app/reads/users";
import {
  revalidateMomentsServerFlow,
  trueCreateOrUpdateMomentServerFlow,
  trueDeleteMomentServerFlow,
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
    [CONTAINS]?: string;
    [USERMOMENTSPAGE]?: string;
    [PASTUSERMOMENTSPAGE]?: string;
    [CURRENTUSERMOMENTSPAGE]?: string;
    [FUTUREUSERMOMENTSPAGE]?: string;
    // now lifted to the URL
    [VIEW]?: string;
    [SUBVIEW]?: string;
    [MOMENTKEY]?: string;
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
    "use server";

    return await trueCreateOrUpdateMomentServerFlow(
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

    return await trueDeleteMomentServerFlow(momentAdapted, user);
  }

  async function revalidateMoments(): Promise<void> {
    "use server";

    return await revalidateMomentsServerFlow(user);
  }

  return (
    <GlobalServerComponents.DefaultErrorBoundary>
      <GlobalServerComponents.DefaultSuspense>
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
      </GlobalServerComponents.DefaultSuspense>
    </GlobalServerComponents.DefaultErrorBoundary>
  );
}
