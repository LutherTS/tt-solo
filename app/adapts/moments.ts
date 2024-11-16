import { TAKE } from "@/app/data/moments";
import { Option } from "@/app/types/globals";
import { SelectDestinationForMoment } from "@/app/types/destinations";
import {
  SelectMomentDefault,
  MomentsAdapted,
  UserMomentsToCRUD,
  View,
  MomentAdapted,
  UserMomentsAdaptedCombined,
  SubView,
} from "@/app/types/moments";
import {
  decodeHashidToUUID,
  encodeUUIDWithHashids,
} from "@/app/utilities/globals";
import { SelectUserIdAndUsername } from "@/app/types/users";
import { findMomentByIdAndUserId } from "@/app/reads/moments";
import { isSubView } from "@/app/utilities/moments";

export const adaptView = (rawView: string | undefined): View => {
  switch (rawView) {
    case "update-moment":
      return "update-moment";
    case "read-moments":
      return "read-moments";
    case "create-moment":
      return "create-moment";

    default:
      return "create-moment";
  }
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
    case "update-moment":
      if (moment) return { view, moment };
      else return { view: "read-moments", moment };
    case "read-moments":
      return { view, moment: undefined };
    case "create-moment":
      return { view, moment: undefined };

    default:
      return { view, moment };
  }
};

export const falseAdaptMoments = (
  rawMoments: SelectMomentDefault[][],
  pages: number[],
  totals: readonly [number, number, number, number],
  maxPages: number[],
): UserMomentsToCRUD[] =>
  rawMoments.map((e, i, a) => {
    return {
      dates: [
        ...new Set(e.map((moment) => moment.startDateAndTime.split("T")[0])),
      ].map((e3) => {
        return {
          date: e3,
          destinations: [
            // this set used to filter strings, but now it has to filter objects
            ...new Set(
              e
                .filter((moment) => moment.startDateAndTime.startsWith(e3))
                .map((moment) => {
                  const momentDestinationId = encodeUUIDWithHashids(
                    moment.destination.id,
                  );

                  // to get the object as a string...
                  return JSON.stringify({
                    // id: moment.destination.id,
                    id: momentDestinationId,
                    destinationIdeal: moment.destination.name,
                  });
                }),
            ),
          ]
            // ...and then as a string back to an object
            .map((e) => JSON.parse(e))
            // organizes destinations per day alphabetically
            .sort((a, b) => {
              const destinationA = a.destinationIdeal.toLowerCase();
              const destinationB = b.destinationIdeal.toLowerCase();
              if (destinationA < destinationB) return -1;
              if (destinationB > destinationA) return 1;
              return 0;
              // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#sorting_array_of_objects
            })
            .map((e4) => {
              return {
                id: e4.id as string,
                destinationIdeal: e4.destinationIdeal as string,
                moments: e
                  .filter(
                    (moment) =>
                      moment.destination.name === e4.destinationIdeal &&
                      moment.startDateAndTime.startsWith(e3),
                  )
                  // organizes moments per destination chronologically
                  .sort((a, b) => {
                    const startDateAndTimeA = a.startDateAndTime;
                    const startDateAndTimeB = b.startDateAndTime;
                    if (startDateAndTimeA < startDateAndTimeB) return -1;
                    if (startDateAndTimeB > startDateAndTimeA) return 1;
                    return 0;
                  })
                  .map((e5) => {
                    const momentId = encodeUUIDWithHashids(e5.id);

                    return {
                      // id: e5.id,
                      id: momentId,
                      activity: e5.activity,
                      objective: e5.name,
                      isIndispensable: e5.isIndispensable,
                      context: e5.description,
                      startDateAndTime: e5.startDateAndTime,
                      duration: e5.duration,
                      endDateAndTime: e5.endDateAndTime,
                      steps: e5.steps.map((e6) => {
                        const stepId = encodeUUIDWithHashids(e6.id);

                        return {
                          // id: e6.id,
                          id: stepId,
                          orderId: e6.orderId,
                          title: e6.name,
                          details: e6.description,
                          startDateAndTime: e6.startDateAndTime,
                          duration: e6.duration,
                          endDateAndTime: e6.endDateAndTime,
                        };
                      }),
                      destinationIdeal: e4.destinationIdeal,
                    };
                  }),
              };
            }),
          momentsTotal: a[i].length,
          momentFirstIndex: (pages[i] - 1) * TAKE + 1,
          momentLastIndex: (pages[i] - 1) * TAKE + a[i].length,
          allMomentsTotal: totals[i],
          currentPage: pages[i],
          totalPage: maxPages[i],
        };
      }),
    };
  });

export const adaptMoments = (
  rawMoments: SelectMomentDefault[],
  page: number,
  total: number,
  maxPage: number,
): MomentsAdapted => {
  return {
    dates: [
      ...new Set(
        rawMoments.map((moment) => moment.startDateAndTime.split("T")[0]),
      ),
    ].map((e) => {
      return {
        date: e,
        destinations: [
          // this set used to filter strings, but now it has to filter objects
          ...new Set(
            rawMoments
              .filter((moment) => moment.startDateAndTime.startsWith(e))
              .map((moment) => {
                const momentDestinationId = encodeUUIDWithHashids(
                  moment.destination.id,
                );

                // to get the object as a string...
                return JSON.stringify({
                  key: momentDestinationId,
                  destinationIdeal: moment.destination.name,
                });
              }),
          ),
        ]
          // ...and then as a string back to an object
          .map((e) => JSON.parse(e))
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
              key: e2.key as string,
              destinationIdeal: e2.destinationIdeal as string,
              moments: rawMoments
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
    }),
    pageDetails: {
      page,
      total,
      maxPage,
      momentsTotal: rawMoments.length,
      momentsFirstIndex: (page - 1) * TAKE + 1,
      momentsLastIndex: (page - 1) * TAKE + rawMoments.length,
    },
  };
};

export const adaptMoment = (moment: SelectMomentDefault) => {
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
        ? "current-moments"
        : userFutureMomentsAdapted.dates.length > 0
          ? "future-moments"
          : userPastMomentsAdapted.dates.length > 0
            ? "past-moments"
            : "all-moments";

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
