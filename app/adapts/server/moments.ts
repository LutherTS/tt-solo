// "use server";
// Proposes "use server" to enforce a Server Module.

// Adapts are not only clearly meant to be used exclusively on the server, it is dangerous for them to be used on the client as they adapt raw data.

/* IMPORTS */

// Internal imports

import { findMomentByIdAndUserId } from "@/app/readings/server/reads/moments";
import { subViews, TAKE, views } from "@/app/constants/agnostic/moments";
import {
  decodeHashidToUUID,
  encodeUUIDWithHashids,
} from "@/app/utilities/server/globals";
import { isSubView, isView } from "@/app/utilities/agnostic/moments";

// Types imports

import type { SelectUserIdAndUsername } from "@/app/types/server/users";
import type { SelectMomentDefault } from "@/app/types/server/moments";
import type { SelectDestinationForMoment } from "@/app/types/server/destinations";
import type { Option } from "@/app/types/agnostic/globals";
import type {
  View,
  MomentAdapted,
  UserMomentsAdaptedCombined,
  SubView,
  PageDetails,
  DateAdapted,
} from "@/app/types/agnostic/moments";

/* LOGIC */

export const adaptView = (rawView: string | undefined): View => {
  if (isView(rawView)) return rawView;
  else return views.CREATE_MOMENT;
};

export const adaptMomentKey = async (
  rawMomentKey: string | undefined,
  user: SelectUserIdAndUsername,
): Promise<MomentAdapted | undefined> => {
  if (!rawMomentKey) return undefined;
  else {
    const moment = await findMomentByIdAndUserId(
      decodeHashidToUUID(rawMomentKey),
      user.id,
    );

    if (!moment) return undefined;
    else return adaptMoment(moment);
  }
};

export const adaptedViewAndMomentCombined = (
  view: View,
  moment: MomentAdapted | undefined,
): { view: View; moment: MomentAdapted | undefined } => {
  switch (view) {
    case views.UPDATE_MOMENT:
      if (moment) return { view, moment };
      else return { view: views.READ_MOMENTS, moment };
    case views.READ_MOMENTS:
      return { view, moment: undefined };
    case views.CREATE_MOMENT:
      return { view, moment: undefined };

    default:
      return { view, moment };
  }
};

export const adaptMomentsDates = ({
  userMoments,
}: {
  userMoments: SelectMomentDefault[];
}): DateAdapted[] => {
  return [
    ...new Set(
      userMoments.map((moment) => moment.startDateAndTime.split("T")[0]),
    ),
  ].map((e) => {
    const map = new Map<
      string,
      {
        key: string;
        destinationIdeal: string;
      }
    >();

    userMoments
      .filter((moment) => moment.startDateAndTime.startsWith(e))
      .forEach((moment) => {
        const momentDestinationId = encodeUUIDWithHashids(
          moment.destination.id,
        );

        map.set(momentDestinationId, {
          key: momentDestinationId,
          destinationIdeal: moment.destination.name,
        });
      });

    const destinations = [...map.values()];

    return {
      date: e,
      destinations: destinations
        // organizes destinations per day alphabetically
        .sort((a, b) => {
          const destinationA = a.destinationIdeal.toLowerCase();
          const destinationB = b.destinationIdeal.toLowerCase();
          if (destinationA < destinationB) return -1;
          if (destinationB > destinationA) return 1;
          return 0;
          // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#sorting_array_of_objects
        })
        .map((e2) => {
          return {
            key: e2.key,
            destinationIdeal: e2.destinationIdeal,
            moments: userMoments
              .filter(
                (moment) =>
                  moment.destination.name === e2.destinationIdeal &&
                  moment.startDateAndTime.startsWith(e),
              )
              // organizes moments per destination chronologically
              .sort((a, b) => {
                const startDateAndTimeA = a.startDateAndTime;
                const startDateAndTimeB = b.startDateAndTime;
                if (startDateAndTimeA < startDateAndTimeB) return -1;
                if (startDateAndTimeB > startDateAndTimeA) return 1;
                return 0;
              })
              .map((e3) => adaptMoment(e3)),
          };
        }),
    };
  });
};

export const adaptMomentsPageDetails = ({
  userMoments,
  userMomentsPage,
  userMomentsTotal,
  userMomentsMaxPage,
}: {
  userMoments: SelectMomentDefault[];
  userMomentsPage: number;
  userMomentsTotal: number;
  userMomentsMaxPage: number;
}): PageDetails => {
  return {
    page: userMomentsPage,
    total: userMomentsTotal,
    maxPage: userMomentsMaxPage,
    momentsTotal: userMoments.length,
    momentsFirstIndex: (userMomentsPage - 1) * TAKE + 1,
    momentsLastIndex: (userMomentsPage - 1) * TAKE + userMoments.length,
  };
};

export const adaptMoment = (moment: SelectMomentDefault): MomentAdapted => {
  const momentKey = encodeUUIDWithHashids(moment.id);

  return {
    key: momentKey,
    activity: moment.activity,
    objective: moment.name,
    isIndispensable: moment.isIndispensable,
    context: moment.description,
    startDateAndTime: moment.startDateAndTime,
    duration: moment.duration,
    endDateAndTime: moment.endDateAndTime,
    steps: moment.steps.map((step) => {
      const stepKey = encodeUUIDWithHashids(step.id);

      return {
        key: stepKey,
        orderId: step.orderId,
        title: step.name,
        details: step.description,
        startDateAndTime: step.startDateAndTime,
        duration: step.duration,
        endDateAndTime: step.endDateAndTime,
      };
    }),
    destinationIdeal: moment.destination.name,
  };
};

export const adaptSubView = (
  rawSubView: string | undefined,
  userMomentsAdaptedCombined: UserMomentsAdaptedCombined,
): SubView => {
  if (isSubView(rawSubView)) return rawSubView;
  else {
    const {
      userPastMomentsAdapted,
      userCurrentMomentsAdapted,
      userFutureMomentsAdapted,
    } = userMomentsAdaptedCombined;

    let initialSubView: SubView =
      userCurrentMomentsAdapted.dates.length > 0
        ? subViews.CURRENT_MOMENTS
        : userFutureMomentsAdapted.dates.length > 0
          ? subViews.FUTURE_MOMENTS
          : userPastMomentsAdapted.dates.length > 0
            ? subViews.PAST_MOMENTS
            : subViews.ALL_MOMENTS;

    return initialSubView;
  }
};

export const adaptDestinationsForMoment = (
  rawDestinations: SelectDestinationForMoment[],
): Option[] =>
  rawDestinations
    .sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (nameA < nameB) return -1;
      if (nameB > nameA) return 1;
      return 0;
    })
    .map((e) => {
      return {
        key: encodeUUIDWithHashids(e.id),
        label: e.name,
        value: e.name,
      };
    });
