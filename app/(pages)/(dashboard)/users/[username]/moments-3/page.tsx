// "use server"
// Proposes "use server" to enforce a Server Module.

import { notFound } from "next/navigation";

import * as GlobalServerComponents from "@/app/components/agnostic";
import Core from "./server";
import { Option } from "@/app/types/globals";
import {
  UserMomentsToCRUD,
  StepFromClient,
  MomentToCRUD,
  MomentFormVariant,
  CreateOrUpdateMomentError,
  CreateOrUpdateMomentSuccess,
  SelectMomentDefault,
} from "@/app/types/moments";
import {
  dateToInputDatetime,
  defineCurrentPage,
  defineMoment,
  defineSubView,
  defineView,
  defineWithViewAndMoment,
} from "@/app/utilities/moments";
import {
  momentsPageSearchParamsKeys,
  INITIAL_PAGE,
  TAKE,
  MOMENTS_PAGE_SEARCH_PARAMS_KEYS_OF_PAGES,
} from "@/app/constants/moments";
import { findUserIdByUsername } from "@/app/reads/users";
import {
  countUserCurrentMomentsWithContains,
  countUserFutureMomentsWithContains,
  countUserPastMomentsWithContains,
  falseCountUserAllMomentsWithContains,
  findUserCurrentMomentsWithContains,
  findUserFutureMomentsWithContains,
  findUserPastMomentsWithContains,
  falseFindUserAllMomentsWithContains,
} from "@/app/reads/moments";
import { findDestinationsByUserId } from "@/app/reads/destinations";
import {
  revalidateMomentsServerFlow,
  falseCreateOrUpdateMomentServerFlow,
  falseDeleteMomentServerFlow,
} from "@/app/flows/server/moments";
import {
  adaptDestinationsForMoment,
  falseAdaptMoments,
} from "@/app/adapts/moments";

export const dynamic = "force-dynamic";
// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#dynamic

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
  let now = dateToInputDatetime(new Date());
  console.log({ now });

  // PART READ (a.k.a database calls)

  params = await params;
  searchParams = await searchParams;

  const username = params.username;
  // console.log({ username });

  const userFound = await findUserIdByUsername(username);
  // console.log({ userFound });

  if (!userFound) return notFound();

  const user = userFound;

  const userId = user.id;

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

  // obtaining and interpreting view, moment and subView

  const uniqueShownSet = new Set<string>();

  allUserMomentsToCRUD.forEach((e) => {
    e.dates.forEach((e2) => {
      e2.destinations.forEach((e3) => {
        e3.moments.forEach((e4) => {
          uniqueShownSet.add(JSON.stringify(e4));
        });
      });
    });
  });

  const uniqueShownMoments = [...uniqueShownSet].map((e) =>
    JSON.parse(e),
  ) as MomentToCRUD[];
  // console.log({ uniqueShownMoments });

  let definedView = defineView(
    searchParams?.[momentsPageSearchParamsKeys.VIEW],
  );
  // console.log({ definedView });

  let definedMoment = await defineMoment(
    searchParams?.[momentsPageSearchParamsKeys.MOMENT_KEY],
    uniqueShownMoments,
  );
  // console.log({ definedMoment });

  const { view, moment } = defineWithViewAndMoment(definedView, definedMoment);
  // console.log({ view, moment });

  const subView = defineSubView(
    searchParams?.[momentsPageSearchParamsKeys.SUB_VIEW],
    allUserMomentsToCRUD,
  );
  // console.log({ subView });

  // PART WRITE (a.k.a. server actions)

  async function createOrUpdateMoment(
    formData: FormData,
    variant: MomentFormVariant,
    startMomentDate: string,
    steps: StepFromClient[],
    momentFromCRUD: MomentToCRUD | undefined,
    destinationSelect: boolean,
    activitySelect: boolean,
  ): Promise<CreateOrUpdateMomentError | CreateOrUpdateMomentSuccess> {
    "use server"; // "use server functions"
    // Proposes "use server functions" to enforce a Server Fonction.
    // On top of modules, "use server functions" would enforce a Server Functions Module.

    return await falseCreateOrUpdateMomentServerFlow(
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
  ): Promise<CreateOrUpdateMomentError | CreateOrUpdateMomentSuccess> {
    "use server"; // "use server functions"
    // Proposes "use server functions" to enforce a Server Fonction.

    return await falseDeleteMomentServerFlow(momentFromCRUD, user);
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
        allUserMomentsToCRUD={allUserMomentsToCRUD}
        maxPages={maxPages}
        destinationOptions={destinationOptions}
        // writes
        revalidateMoments={revalidateMoments}
        createOrUpdateMoment={createOrUpdateMoment}
        deleteMoment={deleteMoment}
        // states lifted to the URL
        view={view}
        subView={subView}
        moment={moment}
      />
    </GlobalServerComponents.ErrorBoundarySuspense>
  );
}
