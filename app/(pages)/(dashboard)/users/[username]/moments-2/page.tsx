// "use server";
// Proposes "use server" to enforce a Server Module.

/* IMPORTS */

// External imports

import { notFound } from "next/navigation";

// Components imports

import Core from "./agnostic";
import * as GlobalAgnosticComponents from "@/app/components/agnostic";

// Internal imports

import {
  momentsPageSearchParamsKeys,
  INITIAL_PAGE,
  TAKE,
  MOMENTS_PAGE_SEARCH_PARAMS_KEYS_OF_PAGES,
} from "@/app/constants/agnostic/moments";
import {
  dateToInputDatetime,
  defineCurrentPage,
} from "@/app/utilities/agnostic/moments";
import { findUserIdByUsername } from "@/app/readings/server/reads/users";
import {
  countUserCurrentMomentsWithContains,
  countUserFutureMomentsWithContains,
  countUserPastMomentsWithContains,
  falseCountUserAllMomentsWithContains,
  findUserCurrentMomentsWithContains,
  findUserFutureMomentsWithContains,
  findUserPastMomentsWithContains,
  falseFindUserAllMomentsWithContains,
} from "@/app/readings/server/reads/moments";
import { findDestinationsByUserId } from "@/app/readings/server/reads/destinations";
import {
  adaptDestinationsForMoment,
  falseAdaptMoments,
} from "@/app/adapts/server/moments";
import {
  falserDeleteMomentServerFlow,
  revalidateMomentsServerFlow,
  falserCreateOrUpdateMomentServerFlow,
} from "@/app/actions/server/serverflows/moments";

// Types imports

import type { Option } from "@/app/types/agnostic/globals";
import type { SelectMomentDefault } from "@/app/types/server/moments";
import type {
  UserMomentsToCRUD,
  StepFromClient,
  MomentToCRUD,
  MomentFormVariant,
  FalseCreateOrUpdateMomentState,
} from "@/app/types/agnostic/moments";

/* LOGIC */

export const dynamic = "force-dynamic";

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
  };
}) {
  let now = dateToInputDatetime(new Date());
  console.log({ now });

  // PART READ (a.k.a database calls)

  params = await params;

  const username = params.username;
  // console.log({ username });

  const userFound = await findUserIdByUsername(username);
  // console.log({ userFound });

  if (!userFound) return notFound();

  const user = userFound;

  const userId = user.id;

  searchParams = await searchParams;

  // that is one chill searchParam right here
  const contains = searchParams?.[momentsPageSearchParamsKeys.CONTAINS] || "";
  // console.log({ contains });

  const [
    userMomentsTotal,
    pastUserMomentsTotal,
    currentUserMomentsTotal,
    futureUserMomentsTotal,
  ] = await Promise.all([
    falseCountUserAllMomentsWithContains(userId, contains),
    countUserPastMomentsWithContains(userId, contains, now),
    countUserCurrentMomentsWithContains(userId, contains, now),
    countUserFutureMomentsWithContains(userId, contains, now),
  ]);
  // console.log({
  //   userMomentsTotal,
  //   pastUserMomentsTotal,
  //   currentUserMomentsTotal,
  //   futureUserMomentsTotal,
  // });

  const totals = [
    userMomentsTotal,
    pastUserMomentsTotal,
    currentUserMomentsTotal,
    futureUserMomentsTotal,
  ] as const;
  // console.log({ totals })

  const maxPages = totals.map((e) => Math.ceil(e / TAKE));
  // console.log({ maxPages });

  const pages = MOMENTS_PAGE_SEARCH_PARAMS_KEYS_OF_PAGES.map((e, i) =>
    defineCurrentPage(INITIAL_PAGE, Number(searchParams?.[e]), maxPages[i]),
  );
  // console.log({ pages });

  const [
    userMomentsPage,
    pastUserMomentsPage,
    currentUserMomentsPage,
    futureUserMomentsPage,
  ] = pages;

  const [userMoments, pastUserMoments, currentUserMoments, futureUserMoments] =
    await Promise.all([
      falseFindUserAllMomentsWithContains(userId, contains, userMomentsPage),
      findUserPastMomentsWithContains(
        userId,
        contains,
        now,
        pastUserMomentsPage,
      ),
      findUserCurrentMomentsWithContains(
        userId,
        contains,
        now,
        currentUserMomentsPage,
      ),
      findUserFutureMomentsWithContains(
        userId,
        contains,
        now,
        futureUserMomentsPage,
      ),
    ]);
  // console.log({
  //   userMoments,
  //   pastUserMoments,
  //   currentUserMoments,
  //   futureUserMoments,
  // });

  const userDestinations = await findDestinationsByUserId(userId);
  // console.log({ userDestinations });

  // adapting data for the client

  const allUserMoments: SelectMomentDefault[][] = [
    userMoments,
    pastUserMoments,
    currentUserMoments,
    futureUserMoments,
  ];
  // console.log({ allUserMoments });

  const allUserMomentsToCRUD: UserMomentsToCRUD[] = falseAdaptMoments(
    allUserMoments,
    pages,
    totals,
    maxPages,
  );
  // console.logs on demand...

  const destinationOptions: Option[] =
    adaptDestinationsForMoment(userDestinations);
  // console.logs on demand...

  // PART WRITE (a.k.a. server actions)

  async function createOrUpdateMoment(
    formData: FormData,
    variant: MomentFormVariant,
    startMomentDate: string,
    steps: StepFromClient[],
    momentFromCRUD: MomentToCRUD | undefined,
    destinationSelect: boolean,
    activitySelect: boolean,
  ): Promise<FalseCreateOrUpdateMomentState> {
    "use server"; // "use server functions"
    // Proposes "use server functions" to enforce a Server Fonction.
    // On top of modules, "use server functions" would enforce a Server Functions Module.

    return await falserCreateOrUpdateMomentServerFlow(
      formData,
      variant,
      startMomentDate,
      steps,
      momentFromCRUD,
      destinationSelect,
      activitySelect,
      user,
    );
  }

  async function deleteMoment(
    momentFromCRUD: MomentToCRUD | undefined,
  ): Promise<FalseCreateOrUpdateMomentState> {
    "use server"; // "use server functions"
    // Proposes "use server functions" to enforce a Server Fonction.

    return await falserDeleteMomentServerFlow(momentFromCRUD, user);
  }

  async function revalidateMoments(): Promise<void> {
    "use server"; // "use server functions"
    // Proposes "use server functions" to enforce a Server Fonction.

    return await revalidateMomentsServerFlow(user);
  }

  return (
    <GlobalAgnosticComponents.ErrorBoundarySuspense>
      <Core
        now={now}
        allUserMomentsToCRUD={allUserMomentsToCRUD}
        maxPages={maxPages}
        destinationOptions={destinationOptions}
        revalidateMoments={revalidateMoments}
        createOrUpdateMoment={createOrUpdateMoment}
        deleteMoment={deleteMoment}
      />
    </GlobalAgnosticComponents.ErrorBoundarySuspense>
  );
}
