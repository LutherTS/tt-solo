import {
  adaptDestinationsForMoment,
  adaptedViewAndMomentCombined,
  adaptMomentKey,
  adaptMoments,
  adaptSubView,
  adaptView,
} from "@/app/adapts/moments";
import {
  momentsPageSearchParamsKeys,
  INITIAL_PAGE,
  subViews,
  subViewsCountUserMomentsWithContains,
  subViewsFindUserMomentsWithContains,
  subViewsPages,
  TAKE,
} from "@/app/data/moments";
import { findDestinationsByUserId } from "@/app/reads/destinations";
import { Option } from "@/app/types/globals";
import {
  MomentsPageSearchParamsRaw,
  SubView,
  UserMomentsAdaptedCombined,
} from "@/app/types/moments";
import { SelectUserIdAndUsername } from "@/app/types/users";
import { defineCurrentPage } from "@/app/utilities/moments";

// import { delay } from "@/app/utilities/globals";

export async function fetchViewAndMomentDataFlow(
  searchParams: MomentsPageSearchParamsRaw,
  user: SelectUserIdAndUsername,
) {
  // await delay(5000, () => console.log("After 5 seconds")); // The reason why the whole UI blocks with this is because I need the view-moment combo to properly show the text. (I could load everything but the text if I wanted though, but I think other components currently depend on that centrality.)

  searchParams = await searchParams;

  let adaptedView = adaptView(searchParams?.[momentsPageSearchParamsKeys.VIEW]);
  let adaptedMoment = await adaptMomentKey(
    searchParams?.[momentsPageSearchParamsKeys.MOMENT_KEY],
    user,
  );

  return adaptedViewAndMomentCombined(adaptedView, adaptedMoment);
}

export async function fetchReadMomentsViewDataFlow(
  now: string,
  user: SelectUserIdAndUsername,
  searchParams: MomentsPageSearchParamsRaw,
): Promise<{
  userMomentsAdaptedCombined: UserMomentsAdaptedCombined;
  subView: SubView;
}> {
  // await delay(20000, () => console.log("After 20 seconds")); // with this and the use hook, since I delay the ReadMomentsView, I can already see and use the CreateMomentView in the meantime

  const userId = user.id;

  searchParams = await searchParams;

  const contains = searchParams?.[momentsPageSearchParamsKeys.CONTAINS] || "";

  const fetchSubViewDataInFetchReadMomentsViewDataFlowBound =
    fetchSubViewDataSubFlow.bind(null, now, userId, contains, searchParams);

  const [
    userAllMomentsAdapted,
    userPastMomentsAdapted,
    userCurrentMomentsAdapted,
    userFutureMomentsAdapted,
  ] = await Promise.all([
    fetchSubViewDataInFetchReadMomentsViewDataFlowBound(subViews.ALL_MOMENTS),
    fetchSubViewDataInFetchReadMomentsViewDataFlowBound(subViews.PAST_MOMENTS),
    fetchSubViewDataInFetchReadMomentsViewDataFlowBound(
      subViews.CURRENT_MOMENTS,
    ),
    fetchSubViewDataInFetchReadMomentsViewDataFlowBound(
      subViews.FUTURE_MOMENTS,
    ),
  ]);

  const userMomentsAdaptedCombined = {
    userAllMomentsAdapted,
    userPastMomentsAdapted,
    userCurrentMomentsAdapted,
    userFutureMomentsAdapted,
  };

  const subView = adaptSubView(
    searchParams?.[momentsPageSearchParamsKeys.SUB_VIEW],
    userMomentsAdaptedCombined,
  );

  return {
    userMomentsAdaptedCombined,
    subView,
  };
}

const fetchSubViewDataSubFlow = async (
  now: string,
  userId: string,
  contains: string,
  searchParams: MomentsPageSearchParamsRaw,
  subView: SubView,
) => {
  const countUserMomentsWithContains =
    subViewsCountUserMomentsWithContains[subView];

  const userMomentsTotal = await countUserMomentsWithContains(
    userId,
    contains,
    now,
  );

  const userMomentsMaxPage = Math.ceil(userMomentsTotal / TAKE);

  const MOMENTSPAGE = subViewsPages[subView];

  const userMomentsPage = defineCurrentPage(
    INITIAL_PAGE,
    Number(searchParams?.[MOMENTSPAGE]),
    userMomentsMaxPage,
  );

  const findUserMomentsWithContains =
    subViewsFindUserMomentsWithContains[subView];

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
};

export async function fetchMomentFormsDataFlow(user: SelectUserIdAndUsername) {
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
//     Number(searchParams?.[momentsPageSearchParamsKeys.USER_ALL_MOMENTS_PAGE]),
//     userAllMomentsMaxPage,
//   ),
//   defineCurrentPage(
//     INITIAL_PAGE,
//     Number(searchParams?.[momentsPageSearchParamsKeys.USER_PAST_MOMENTS_PAGE]),
//     userPastMomentsMaxPage,
//   ),
//   defineCurrentPage(
//     INITIAL_PAGE,
//     Number(searchParams?.[momentsPageSearchParamsKeys.USER_CURRENT_MOMENTS_PAGE]),
//     userCurrentMomentsMaxPage,
//   ),
//   defineCurrentPage(
//     INITIAL_PAGE,
//     Number(searchParams?.[momentsPageSearchParamsKeys.USER_FUTURE_MOMENTS_PAGE]),
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
