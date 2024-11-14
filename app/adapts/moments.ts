import { TAKE } from "../data/moments";
import { Option } from "@/app/types/globals";
import { SelectDestinationForMoment } from "../types/destinations";
import { SelectMomentDefault, UserMomentsToCRUD } from "../types/moments";

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
                  // to get the object as a string...
                  return JSON.stringify({
                    id: moment.destination.id,
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
                id: e4.id,
                destinationIdeal: e4.destinationIdeal,
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
                    return {
                      id: e5.id,
                      activity: e5.activity,
                      objective: e5.name,
                      isIndispensable: e5.isIndispensable,
                      context: e5.description,
                      startDateAndTime: e5.startDateAndTime,
                      duration: e5.duration,
                      endDateAndTime: e5.endDateAndTime,
                      steps: e5.steps.map((e6) => {
                        return {
                          id: e6.id,
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
    .map((e, i) => {
      return {
        // I'll have to think someday about bcrypting my keys because they show in the React Developer Tools. Maybe just having an entry in the database that is called key which would be the id of the entry encrypted.
        // This will be especially necessary in order not retrieve ids from the database but sometimes rather retrieve keys instead. (Still it'd might be necessary in params or searchParams but I'm not sure.) Next time.
        key: i + 1,
        label: e.name,
        value: e.name,
      };
    });
