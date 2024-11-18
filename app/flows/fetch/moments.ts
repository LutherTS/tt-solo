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
  subViews,
  subViewsCountUserMomentsWithContains,
  subViewsFindUserMomentsWithContains,
  subViewsPages,
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

// import { delay } from "@/app/utilities/globals";

export async function fetchViewAndMomentDataFlow(
  searchParams: MomentsPageSearchParams,
  user: SelectUserIdAndUsername,
) {
  // await delay(5000, () => console.log("After 5 seconds")); // The reason why the whole UI blocks with this is because I need the view-moment combo to properly show the text. (I could load everything but the text if I wanted though, but I think other components currently depend on that centrality.)

  searchParams = await searchParams;

  let adaptedView = adaptView(searchParams?.[VIEW]);
  let adaptedMoment = await adaptMomentKey(searchParams?.[MOMENTKEY], user);

  return adaptedViewAndMomentCombined(adaptedView, adaptedMoment);
}

export const fetchReadMomentsViewDataFlow = async (
  now: string,
  user: SelectUserIdAndUsername,
  searchParams: MomentsPageSearchParams,
): Promise<{
  userMomentsAdaptedCombined: UserMomentsAdaptedCombined;
  subView: SubView;
}> => {
  // await delay(20000, () => console.log("After 20 seconds")); // with this and the use hook, since I delay the ReadMomentsView, I can already see and use the CreateMomentView in the meantime

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
}

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
