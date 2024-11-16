import {
  adaptDestinationsForMoment,
  trueAdaptMoments,
} from "@/app/adapts/moments";
import {
  CONTAINS,
  INITIAL_PAGE,
  subViewCountUserMomentsWithContains,
  subViewFindUserMomentsWithContains,
  subViewPages,
  TAKE,
} from "@/app/data/moments";
import { findDestinationsByUserId } from "@/app/reads/destinations";
import { Option } from "@/app/types/globals";
import { MomentsPageSearchParams, SubView } from "@/app/types/moments";
import { SelectUserIdAndUsername } from "@/app/types/users";
import { defineCurrentPage } from "@/app/utilities/moments";

export async function fetchReadMomentsViewFlow(
  now: string,
  user: SelectUserIdAndUsername,
  searchParams: MomentsPageSearchParams,
) {
  const userId = user.id;

  searchParams = await searchParams;

  const contains = searchParams?.[CONTAINS] || "";

  const fetchSubViewInFetchReadMomentsViewFlowBound =
    fetchSubViewInFetchReadMomentsViewFlow.bind(
      null,
      now,
      userId,
      contains,
      searchParams,
    );

  const [
    userAllMomentsAdapted,
    userPastMomentsAdapted,
    userCurrentMomentsAdapted,
    userFutureMomentsAdapted,
  ] = await Promise.all([
    fetchSubViewInFetchReadMomentsViewFlowBound("all-moments"),
    fetchSubViewInFetchReadMomentsViewFlowBound("past-moments"),
    fetchSubViewInFetchReadMomentsViewFlowBound("current-moments"),
    fetchSubViewInFetchReadMomentsViewFlowBound("future-moments"),
  ]);

  return {
    userAllMomentsAdapted,
    userPastMomentsAdapted,
    userCurrentMomentsAdapted,
    userFutureMomentsAdapted,
  };
}

export async function fetchSubViewInFetchReadMomentsViewFlow(
  now: string,
  userId: string,
  contains: string,
  searchParams: MomentsPageSearchParams,
  subView: SubView,
) {
  const countUserMomentsWithContains =
    subViewCountUserMomentsWithContains[subView];

  const userMomentsTotal = await countUserMomentsWithContains(
    userId,
    contains,
    now,
  );

  const userMomentsMaxPage = Math.ceil(userMomentsTotal / TAKE);

  const MOMENTSPAGE = subViewPages[subView];

  const userMomentsPage = defineCurrentPage(
    INITIAL_PAGE,
    Number(searchParams?.[MOMENTSPAGE]),
    userMomentsMaxPage,
  );

  const findUserMomentsWithContains =
    subViewFindUserMomentsWithContains[subView];

  // read
  const userMoments = await findUserMomentsWithContains(
    userId,
    contains,
    now,
    userMomentsPage,
  );

  // adapt
  const userMomentsAdapted = trueAdaptMoments(
    userMoments,
    userMomentsPage,
    userMomentsTotal,
    userMomentsMaxPage,
  );

  return userMomentsAdapted;
}

export async function fetchMomentFormsViewFlow(user: SelectUserIdAndUsername) {
  // read
  const userDestinations = await findDestinationsByUserId(user.id);

  // adapt
  const destinationOptions: Option[] =
    adaptDestinationsForMoment(userDestinations);

  return { destinationOptions };
}

/* Notes
Completely optimized:
// const [
//   userAllMomentsTotal,
//   userPastMomentsTotal,
//   userCurrentMomentsTotal,
//   userFutureMomentsTotal,
// ] = await Promise.all([
//   countUserAllMomentsWithContains(userId, contains),
//   countPastUserMomentsWithContains(userId, contains, now),
//   countCurrentUserMomentsWithContains(userId, contains, now),
//   countFutureUserMomentsWithContains(userId, contains, now),
// ]);

// const [
//   userAllMomentsMaxPage,
//   userPastMomentsMaxPage,
//   userCurrentMomentsMaxPage,
//   userFutureMomentsMaxPage,
// ] = [
//   Math.ceil(userAllMomentsTotal / TAKE),
//   Math.ceil(userPastMomentsTotal / TAKE),
//   Math.ceil(userCurrentMomentsTotal / TAKE),
//   Math.ceil(userFutureMomentsTotal / TAKE),
// ];

// const [
//   userAllMomentsPage,
//   userPastMomentsPage,
//   userCurrentMomentsPage,
//   userFutureMomentsPage,
// ] = [
//   defineCurrentPage(
//     INITIAL_PAGE,
//     Number(searchParams?.[USERMOMENTSPAGE]),
//     userAllMomentsMaxPage,
//   ),
//   defineCurrentPage(
//     INITIAL_PAGE,
//     Number(searchParams?.[PASTUSERMOMENTSPAGE]),
//     userPastMomentsMaxPage,
//   ),
//   defineCurrentPage(
//     INITIAL_PAGE,
//     Number(searchParams?.[CURRENTUSERMOMENTSPAGE]),
//     userCurrentMomentsMaxPage,
//   ),
//   defineCurrentPage(
//     INITIAL_PAGE,
//     Number(searchParams?.[FUTUREUSERMOMENTSPAGE]),
//     userFutureMomentsMaxPage,
//   ),
// ];

// const [
//   userAllMoments,
//   userPastMoments,
//   userCurrentMoments,
//   userFutureMoments,
// ] = await Promise.all([
//   findUserAllMomentsWithContains(userId, contains, userAllMomentsPage),
//   findPastUserMomentsWithContains(userId, contains, now, userPastMomentsPage),
//   findCurrentUserMomentsWithContains(
//     userId,
//     contains,
//     now,
//     userCurrentMomentsPage,
//   ),
//   findFutureUserMomentsWithContains(
//     userId,
//     contains,
//     now,
//     userFutureMomentsPage,
//   ),
// ]);

// const [
//   userAllMomentsAdapted,
//   userPastMomentsAdapted,
//   userCurrentMomentsAdapted,
//   userFutureMomentsAdapted,
// ] = [
//   trueAdaptMoments(
//     userAllMoments,
//     userAllMomentsPage,
//     userAllMomentsTotal,
//     userAllMomentsMaxPage,
//   ),
//   trueAdaptMoments(
//     userPastMoments,
//     userPastMomentsPage,
//     userPastMomentsTotal,
//     userPastMomentsMaxPage,
//   ),
//   trueAdaptMoments(
//     userCurrentMoments,
//     userCurrentMomentsPage,
//     userCurrentMomentsTotal,
//     userCurrentMomentsMaxPage,
//   ),
//   trueAdaptMoments(
//     userFutureMoments,
//     userFutureMomentsPage,
//     userFutureMomentsTotal,
//     userFutureMomentsMaxPage,
//   ),
// ];
*/
