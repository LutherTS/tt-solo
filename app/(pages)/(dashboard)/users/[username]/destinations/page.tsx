import { revalidatePath } from "next/cache";

import prisma from "@/prisma/db";

import { CRUD } from "./crud";

type StepForCRUD = {
  id: string;
  orderId: number;
  title: string;
  details: string;
  startDateAndTime: string;
  duration: string;
  endDateAndTime: string;
};

type MomentForCRUD = {
  id: string;
  activity: string;
  objective: string;
  isIndispensable: boolean;
  context: string;
  startDateAndTime: string;
  duration: string;
  endDateAndTime: string;
  steps: StepForCRUD[];
};

type DestinationForCRUD = {
  id: string;
  ideal: string;
  aspiration: string | null;
  dates: {
    date: string;
    moments: MomentForCRUD[];
  }[];
};

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

  const userDestinations = await prisma.destination.findMany({
    where: {
      userId: user.id,
    },
    include: {
      moments: {
        orderBy: {
          startDateAndTime: "asc",
        },
        include: {
          steps: {
            orderBy: {
              orderId: "asc",
            },
          },
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  // console.log(userDestinations);
  // userDestinations.forEach((e) => {
  //   console.log(e.moments);
  //   e.moments.forEach((e2) => console.log(e2.steps));
  // });

  // Pour l'instant je laisse, mais il va falloir aussi séparer entre ce qui est à venir, ce qui est en cours, et ce qui est déjà fait. Donc toujours avec le temps. Mais peut-être que ça peut être laisser au client pour l'instantanéité.
  const destinationsForCRUD: DestinationForCRUD[] = userDestinations.map(
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

  // console.log(destinationsForCRUD);
  // destinationsForCRUD.forEach((e) => {
  //   console.log(e.dates);
  //   e.dates.forEach((e2) => {
  //     console.log(e2.moments);
  //     e2.moments.forEach((e3) => {
  //       console.log(e3.steps);
  //     });
  //   });
  // });

  // OK. THIS IS WHERE IT STARTS.
  // The goal is for Moments and Destinations to be pretty much two different ways to view the same data, two different contexts in viewing moments.
  // - on Moments, day comes first, then destinations and moments
  // - on Destinations, destination comes first, then days and moments
  // ALL OF THIS, IN BOTH CASES, COMPUTE FROM THE SERVER, THEN SENT TO THE CLIENT. Starting with Destinations here for ease of adapting.
  // And yes, now is going to remain on the server.
  // La décision est prise : startDateAndTime et EndDateAndTime vont être enreg

  async function createOrUpdateDestination(
    variant: "creating" | "updating",
    destinationForCRUD: DestinationForCRUD | undefined,
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
      if (!destinationForCRUD)
        return console.error("Somehow a destination was not passed.");

      await prisma.destination.update({
        where: {
          id: destinationForCRUD.id,
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

  async function deleteDestination(destinationForCRUD: DestinationForCRUD) {
    "use server";

    await prisma.destination.delete({
      where: {
        id: destinationForCRUD.id,
      },
    });

    revalidatePath(`/users/${username}/moments`);
  }

  return (
    <CRUD
      destinationsForCRUD={destinationsForCRUD}
      createOrUpdateDestination={createOrUpdateDestination}
      deleteDestination={deleteDestination}
    />
  );
}
