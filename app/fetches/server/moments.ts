// no directive
// Proposes no directive to enforce a Server Module.

/* IMPORTS */

// Internal imports

import { findDestinationsByUserId } from "@/app/reads/server/destinations";
import {
  adaptDestinationsForMoment,
  adaptedViewAndMomentCombined,
  adaptMomentKey,
  adaptMomentsDates,
  adaptMomentsPageDetails,
  adaptSubView,
  adaptView,
} from "@/app/adapts/server/moments";
import {
  subViewsCountUserMomentsWithContains,
  subViewsFindUserMomentsWithContains,
} from "@/app/constants/server/moments";
import {
  momentsPageSearchParamsKeys,
  INITIAL_PAGE,
  subViews,
  subViewsPages,
  TAKE,
} from "@/app/constants/agnostic/moments";
// import { delay } from "@/app/utilities/agnostic/globals";
import { defineCurrentPage } from "@/app/utilities/agnostic/moments";

// Types imports

import type { SelectUserIdAndUsername } from "@/app/types/server/users";
import type { MomentsPageSearchParamsRaw } from "@/app/types/server/moments";
import type { SubView } from "@/app/types/agnostic/moments";

/* LOGIC */

// ...Okay. There's (or was?) a serious issue of consistency here.

export const fetchViewAndMomentDataFlow = async (
  searchParams: MomentsPageSearchParamsRaw,
  user: SelectUserIdAndUsername,
) => {
  // await delay(5000, () => console.log("After 5 seconds")); // The reason why the whole UI blocks with this is because I need the view-moment combo to properly show the text. (I could load everything but the text if I wanted though, but I think other components currently depend on that centrality.)

  searchParams = await searchParams;

  let adaptedView = adaptView(searchParams?.[momentsPageSearchParamsKeys.VIEW]);
  let adaptedMoment = await adaptMomentKey(
    searchParams?.[momentsPageSearchParamsKeys.MOMENT_KEY],
    user,
  );

  return adaptedViewAndMomentCombined(adaptedView, adaptedMoment);
};

export const fetchReadMomentsViewDataFlow = async (
  now: string,
  user: SelectUserIdAndUsername,
  searchParams: MomentsPageSearchParamsRaw,
) => {
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
};

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

  const dates = adaptMomentsDates({ userMoments });
  const pageDetails = adaptMomentsPageDetails({
    userMoments,
    userMomentsPage,
    userMomentsTotal,
    userMomentsMaxPage,
  });

  return { dates, pageDetails };
};

export const fetchMomentFormsDataFlow = async (
  user: SelectUserIdAndUsername,
) => {
  // read
  const userDestinations = await findDestinationsByUserId(user.id);

  // adapt
  const destinationOptions = adaptDestinationsForMoment(userDestinations);

  return { destinationOptions };
};
