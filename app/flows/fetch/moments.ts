import {
  adaptDestinationsForMoment,
  adaptedViewAndMomentCombined,
  adaptMomentKey,
  adaptMoments,
  adaptSubView,
  adaptView,
} from "@/app/adapts/moments";
import {
  CONTAINS,
  INITIAL_PAGE,
  MOMENTKEY,
  SUBVIEW,
  subViewCountUserMomentsWithContains,
  subViewFindUserMomentsWithContains,
  subViewPages,
  TAKE,
  VIEW,
} from "@/app/data/moments";
import { findDestinationsByUserId } from "@/app/reads/destinations";
import { Option } from "@/app/types/globals";
import {
  MomentsPageSearchParams,
  SubView,
  UserMomentsAdaptedCombined,
} from "@/app/types/moments";
import { SelectUserIdAndUsername } from "@/app/types/users";
import { defineCurrentPage } from "@/app/utilities/moments";

export const fetchReadMomentsViewDataFlow = async (
  now: string,
  user: SelectUserIdAndUsername,
  searchParams: MomentsPageSearchParams,
): Promise<{
  userMomentsAdaptedCombined: UserMomentsAdaptedCombined;
  subView: SubView;
}> => {
  const userId = user.id;

  searchParams = await searchParams;

  const contains = searchParams?.[CONTAINS] || "";

  const fetchSubViewDataInFetchReadMomentsViewDataFlowBound =
    fetchSubViewDataInFetchReadMomentsViewDataFlow.bind(
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
    fetchSubViewDataInFetchReadMomentsViewDataFlowBound("all-moments"),
    fetchSubViewDataInFetchReadMomentsViewDataFlowBound("past-moments"),
    fetchSubViewDataInFetchReadMomentsViewDataFlowBound("current-moments"),
    fetchSubViewDataInFetchReadMomentsViewDataFlowBound("future-moments"),
  ]);

  const userMomentsAdaptedCombined = {
    userAllMomentsAdapted,
    userPastMomentsAdapted,
    userCurrentMomentsAdapted,
    userFutureMomentsAdapted,
  };

  const subView = adaptSubView(
    searchParams?.[SUBVIEW],
    userMomentsAdaptedCombined,
  );

  return {
    userMomentsAdaptedCombined,
    subView,
  };
};

export async function fetchSubViewDataInFetchReadMomentsViewDataFlow(
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
  const userMomentsAdapted = adaptMoments(
    userMoments,
    userMomentsPage,
    userMomentsTotal,
    userMomentsMaxPage,
  );

  return userMomentsAdapted;
}

export async function fetchMomentFormsDataFlow(user: SelectUserIdAndUsername) {
  // read
  const userDestinations = await findDestinationsByUserId(user.id);

  // adapt
  const destinationOptions: Option[] =
    adaptDestinationsForMoment(userDestinations);

  return { destinationOptions };
}

export async function fetchViewAndMomentDataFlow(
  searchParams: MomentsPageSearchParams,
  user: SelectUserIdAndUsername,
) {
  searchParams = await searchParams;

  let adaptedView = adaptView(searchParams?.[VIEW]);
  let adaptedMoment = await adaptMomentKey(searchParams?.[MOMENTKEY], user);

  return adaptedViewAndMomentCombined(adaptedView, adaptedMoment);
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
