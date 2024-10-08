import { revalidatePath } from "next/cache";

import prisma from "@/prisma/db";

import { DestinationToCRUD } from "@/app/types/destinations";
import { dateToInputDatetime } from "@/app/utilities/moments";

import { CRUD } from "./crud";

// the time at rendering as a stable foundation for all time operations
let now = new Date();
// sharing time as string to bypass timezone adaptations
let nowString = dateToInputDatetime(now);
console.log(nowString);

export default async function DestinationsPage({
  params,
}: {
  params: {
    username: string;
  };
}) {
  const username = params.username;

  const user = await prisma.user.findUnique({
    where: { username },
  });
  // console.log(user);

  if (!user) return console.error("Somehow a user was not found.");

  // The take and skip, a.k.a. pagination stuff takes time to implement because I need enough seeds to test it all. That being said, with that logic here, it's already in place and just needs the proper data from the search params and the URLs made on pagination buttons.

  const TAKE = 10;
  const DEFAULT_PAGE = 1;

  const [
    userDestinations,
    userDestinationsAllMomentsCount,
    userDestinationsPastMomentsCount,
    userDestinationsCurrentMomentsCount,
    userDestinationsFutureMomentsCount,
  ] = await Promise.all([
    prisma.destination.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: TAKE,
      skip: (DEFAULT_PAGE - 1) * TAKE,
    }),
    prisma.destination.findMany({
      select: {
        _count: {
          select: {
            moments: true,
          },
        },
      },
      where: {
        userId: user.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: TAKE,
      skip: (DEFAULT_PAGE - 1) * TAKE,
    }),
    prisma.destination.findMany({
      select: {
        _count: {
          select: {
            moments: {
              where: {
                endDateAndTime: {
                  lt: nowString,
                },
              },
            },
          },
        },
      },
      where: {
        userId: user.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: TAKE,
      skip: (DEFAULT_PAGE - 1) * TAKE,
    }),
    prisma.destination.findMany({
      select: {
        _count: {
          select: {
            moments: {
              where: {
                AND: [
                  { startDateAndTime: { lte: nowString } },
                  { endDateAndTime: { gte: nowString } },
                ],
              },
            },
          },
        },
      },
      where: {
        userId: user.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: TAKE,
      skip: (DEFAULT_PAGE - 1) * TAKE,
    }),
    prisma.destination.findMany({
      select: {
        _count: {
          select: {
            moments: {
              where: {
                startDateAndTime: {
                  gt: nowString,
                },
              },
            },
          },
        },
      },
      where: {
        userId: user.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: TAKE,
      skip: (DEFAULT_PAGE - 1) * TAKE,
    }),
  ]);
  // console.log(userDestinations);
  // console.log(userDestinationsAllMomentsCount);
  // console.log(userDestinationsPastMomentsCount);
  // console.log(userDestinationsCurrentMomentsCount);
  // console.log(userDestinationsFutureMomentsCount);

  const destinationsToCRUD: DestinationToCRUD[] = userDestinations.map(
    (e, i) => {
      return {
        id: e.id,
        ideal: e.name,
        aspiration: e.description,
        allMomentsCount: userDestinationsAllMomentsCount[i]._count.moments,
        pastMomentsCount: userDestinationsPastMomentsCount[i]._count.moments,
        currentMomentsCount:
          userDestinationsCurrentMomentsCount[i]._count.moments,
        futureMomentsCount:
          userDestinationsFutureMomentsCount[i]._count.moments,
      };
    },
  );
  // console.log(destinationsToCRUD);

  async function createOrUpdateDestination(
    variant: "creating" | "updating",
    destinationToCRUD: DestinationToCRUD | undefined,
    formData: FormData,
  ) {
    "use server";

    let ideal = formData.get("ideal");
    let aspiration = formData.get("aspiration");

    if (typeof ideal !== "string" || typeof aspiration !== "string")
      return console.error("The destination form was not correctly submitted.");

    if (!user) return console.error("Somehow a user was not found.");

    if (variant === "creating") {
      await prisma.destination.create({
        data: {
          name: ideal,
          description: aspiration,
          userId: user.id,
        },
      });
    }

    if (variant === "updating") {
      if (!destinationToCRUD)
        return console.error("Somehow a destination was not passed.");

      await prisma.destination.update({
        where: {
          id: destinationToCRUD.id,
        },
        data: {
          name: ideal,
          description: aspiration,
          userId: user.id,
        },
      });
    }

    revalidatePath(`/users/${username}/destinations`);
  }

  async function deleteDestination(destinationToCRUD: DestinationToCRUD) {
    "use server";

    await prisma.destination.delete({
      where: {
        id: destinationToCRUD.id,
      },
    });

    revalidatePath(`/users/${username}/destinations`);
  }

  async function revalidateDestinations() {
    "use server";

    revalidatePath(`/users/${username}/destinations`);
  }

  return (
    <CRUD
      destinationsToCRUD={destinationsToCRUD}
      createOrUpdateDestination={createOrUpdateDestination}
      deleteDestination={deleteDestination}
      revalidateDestinations={revalidateDestinations}
    />
  );
}

/* Notes
In raw PostgreSQL, I can get all the counts in the single query. But in Prisma for now I have to do it in several.
A transaction is sequential (or interactive). This is not what I'm looking for. I'm for a required Promise.all... where I'm basically crossing my fingers that no change in this corner of the database will happen within the operation. (I literally just have to replace prisma.$transaction by Promise.all.)
PREVIOUS CODE, my first big one-op mapping:
const destinationsForCRUD: DestinationForCRUD[] = userDestinationsOld.map(
  (e) => {
    return {
      id: e.id,
      ideal: e.name,
      aspiration: e.description,
      dates: [
        ...new Set(
          e.moments.map((moment) => moment.startDateAndTime.split("T")[0]),
        ),
      ].map((e2) => {
        return {
          date: e2,
          moments: e.moments
            .filter((e3) => e3.startDateAndTime.startsWith(e2))
            .map((e3) => {
              return {
                id: e3.id,
                activity: e3.activity,
                objective: e3.name,
                isIndispensable: e3.isIndispensable,
                context: e3.description,
                startDateAndTime: e3.startDateAndTime,
                duration: e3.duration,
                endDateAndTime: e3.endDateAndTime,
                steps: e3.steps.map((e4) => {
                  return {
                    id: e4.id,
                    orderId: e4.orderId,
                    title: e4.name,
                    details: e4.description,
                    startDateAndTime: e4.startDateAndTime,
                    duration: e4.duration,
                    endDateAndTime: e4.endDateAndTime,
                  };
                }),
              };
            }),
        };
      }),
      moments: e.moments,
    };
  },
);
*/
