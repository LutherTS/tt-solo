import { TAKE } from "@/app/data/moments";
import { Option } from "@/app/types/globals";
import { SelectDestinationForMoment } from "@/app/types/destinations";
import {
  SelectMomentDefault,
  MomentsAdapted,
  UserMomentsToCRUD,
} from "@/app/types/moments";
import { encodeUUIDWithHashids } from "../utilities/globals";

export const adaptMoments = (
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

export const trueAdaptMoments = (
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
    ].map((e3) => {
      return {
        date: e3,
        destinations: [
          // this set used to filter strings, but now it has to filter objects
          ...new Set(
            rawMoments
              .filter((moment) => moment.startDateAndTime.startsWith(e3))
              .map((moment) => {
                const momentDestinationId = encodeUUIDWithHashids(
                  moment.destination.id,
                );

                // to get the object as a string...
                return JSON.stringify({
                  // id: moment.destination.id,
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
          .map((e4) => {
            return {
              key: e4.key as string,
              destinationIdeal: e4.destinationIdeal as string,
              moments: rawMoments
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
                .map((e5) => adaptMoment(e5)),
            };
          }),
        // momentsTotal: rawMoments.length,
        // momentFirstIndex: page * TAKE + 1,
        // momentLastIndex: page * TAKE + rawMoments.length,
        // allMomentsTotal: total,
        // currentPage: page,
        // totalPage: maxPage,
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
        // I'll have to think someday about bcrypting my keys because they show in the React Developer Tools. Maybe just having an entry in the database that is called key which would be the id of the entry encrypted.
        // This will be especially necessary in order not retrieve ids from the database but sometimes rather retrieve keys instead. (Still it'd might be necessary in params or searchParams but I'm not sure.) Next time.
        // UPDATE
        // Keys are now implemented. For now I'm only going to use them here since I don't want to disrupt how I'm using moment ids for the UpdateMomentView. But in the future, they'll be thoroughly implemented in my projects, and I rely on self-made, probably even AI-driven slug for new entries getting created. One way or the other, slug are going to be just as important as, and could even replace, these database keys.
        key: encodeUUIDWithHashids(e.id),
        label: e.name,
        value: e.name,
      };
    });

/* Notes
Just like that, none of my ids are sent... Not sure.
If I do these current adapts on the client, which is likely since in an optimal fashion, each component would have to read their promises themselves and adapt the data, 
*/
