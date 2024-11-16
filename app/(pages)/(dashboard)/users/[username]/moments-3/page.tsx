import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { notFound } from "next/navigation";

import * as GlobalServerComponents from "@/app/components/server";
import Core from "./server";
import { Option } from "@/app/types/globals";
import {
  UserMomentsToCRUD,
  StepFromCRUD,
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
  CONTAINS,
  CURRENTUSERMOMENTSPAGE,
  FUTUREUSERMOMENTSPAGE,
  INITIAL_PAGE,
  MOMENTID,
  PASTUSERMOMENTSPAGE,
  SUBVIEW,
  TAKE,
  USERMOMENTSPAGE,
  VIEW,
} from "@/app/data/moments";
import { findUserIdByUsername } from "@/app/reads/users";
import {
  countCurrentUserMomentsWithContains,
  countFutureUserMomentsWithContains,
  countPastUserMomentsWithContains,
  countUserAllMomentsWithContains,
  findCurrentUserMomentsWithContains,
  findFutureUserMomentsWithContains,
  findPastUserMomentsWithContains,
  findUserAllMomentsWithContains,
} from "@/app/reads/moments";
import { findDestinationsByUserId } from "@/app/reads/destinations";
import {
  revalidateMomentsServerFlow,
  createOrUpdateMomentServerFlow,
  deleteMomentServerFlow,
} from "@/app/flows/server/moments";
import { adaptDestinationsForMoment, adaptMoments } from "@/app/adapts/moments";

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
    [CONTAINS]?: string;
    [USERMOMENTSPAGE]?: string;
    [PASTUSERMOMENTSPAGE]?: string;
    [CURRENTUSERMOMENTSPAGE]?: string;
    [FUTUREUSERMOMENTSPAGE]?: string;
    // now lifted to the URL
    [VIEW]?: string;
    [SUBVIEW]?: string;
    [MOMENTID]?: string;
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

  const contains = searchParams?.[CONTAINS] || "";
  // console.log({ contains });

  const [
    userMomentsTotal,
    pastUserMomentsTotal,
    currentUserMomentsTotal,
    futureUserMomentsTotal,
  ] = await Promise.all([
    countUserAllMomentsWithContains(userId, contains),
    countPastUserMomentsWithContains(userId, contains, now),
    countCurrentUserMomentsWithContains(userId, contains, now),
    countFutureUserMomentsWithContains(userId, contains, now),
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

  const searchParamsPageKeys = [
    USERMOMENTSPAGE,
    PASTUSERMOMENTSPAGE,
    CURRENTUSERMOMENTSPAGE,
    FUTUREUSERMOMENTSPAGE,
  ] as const;

  const pages = searchParamsPageKeys.map((e, i) =>
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
      findUserAllMomentsWithContains(userId, contains, userMomentsPage),
      findPastUserMomentsWithContains(
        userId,
        contains,
        now,
        pastUserMomentsPage,
      ),
      findCurrentUserMomentsWithContains(
        userId,
        contains,
        now,
        currentUserMomentsPage,
      ),
      findFutureUserMomentsWithContains(
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

  const allUserMomentsToCRUD: UserMomentsToCRUD[] = adaptMoments(
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

  let definedView = defineView(searchParams?.[VIEW]);
  // console.log({ definedView });

  let definedMoment = await defineMoment(
    searchParams?.[MOMENTID],
    uniqueShownMoments,
  );
  // console.log({ definedMoment });

  const { view, moment } = defineWithViewAndMoment(definedView, definedMoment);
  // console.log({ view, moment });

  const subView = defineSubView(searchParams?.[SUBVIEW], allUserMomentsToCRUD);
  // console.log({ subView });

  // PART WRITE (a.k.a. server actions)

  async function createOrUpdateMoment(
    formData: FormData,
    variant: MomentFormVariant,
    startMomentDate: string,
    steps: StepFromCRUD[],
    momentFromCRUD: MomentToCRUD | undefined,
    destinationSelect: boolean,
    activitySelect: boolean,
  ): Promise<CreateOrUpdateMomentError | CreateOrUpdateMomentSuccess> {
    "use server";

    return await createOrUpdateMomentServerFlow(
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
    "use server";

    return await deleteMomentServerFlow(momentFromCRUD, user);
  }

  async function revalidateMoments(): Promise<void> {
    "use server";

    return await revalidateMomentsServerFlow(user);
  }

  return (
    <ErrorBoundary
      fallback={
        <GlobalServerComponents.FallbackFlex>
          <p>Une erreur est survenue.</p>
        </GlobalServerComponents.FallbackFlex>
      }
    >
      <Suspense
        fallback={
          <GlobalServerComponents.FallbackFlex>
            <p>Loading...</p>
          </GlobalServerComponents.FallbackFlex>
        }
      >
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
      </Suspense>
    </ErrorBoundary>
  );
}
