import { revalidatePath } from "next/cache";

import prisma from "@/prisma/db";

import { CRUD } from "./crud";
import { endDateAndTime } from "@/app/utilities/moments";

type MomentFromCRUD = {
  id: string;
  // destination: string; // already from DestinationFromCRUD here
  activite: string;
  objectif: string;
  indispensable: boolean;
  contexte: string;
  dateetheure: string;
  // etapes: StepFromCRUD[]; // too low level here
  duree: string; // calculated
  findateetheure: string; // calculated
};

type DestinationFromCRUD = {
  id: string;
  objectif: string;
  contexte: string | null;
  moments: MomentFromCRUD[];
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
          dateAndTime: "asc",
        },
        include: {
          steps: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
  console.log(userDestinations);
  userDestinations.forEach((e) => console.log(e.moments));

  // For now I'm working with name description, but that will be updated to objective and context in the database to match with Moment.
  const destinationsToCRUD: DestinationFromCRUD[] = userDestinations.map(
    (e) => {
      return {
        id: e.id,
        objectif: e.name,
        contexte: e.description,
        moments: e.moments.map((e2) => {
          const dureedumoment = e2.steps
            .reduce((acc, curr) => acc + +curr.duration, 0)
            .toString();

          const map: Map<number, number> = new Map();
          let durationTotal = 0;
          for (let j = 0; j < e2.steps.length; j++) {
            durationTotal += +e2.steps[j].duration;
            map.set(j, durationTotal);
          }
          return {
            id: e2.id,
            activite: e2.activity,
            objectif: e2.name,
            indispensable: e2.isIndispensable,
            contexte: e2.description,
            dateetheure: e2.dateAndTime,
            duree: dureedumoment,
            findateetheure: endDateAndTime(e2.dateAndTime, dureedumoment),
          };
        }),
      };
    },
  );

  async function createOrUpdateDestination(
    variant: "creating" | "updating",
    destinationFromCRUD: DestinationFromCRUD | undefined,
    formData: FormData,
  ) {
    "use server";

    let objectif = formData.get("objectif");
    let contexte = formData.get("contexte");

    if (typeof objectif !== "string" || typeof contexte !== "string")
      return console.error(
        "Le formulaire da destination n'a pas été correctement renseigné.",
      );

    if (!user) return console.error("Somehow a user was not found.");

    if (variant === "creating") {
      await prisma.destination.create({
        data: {
          name: objectif,
          description: contexte,
          userId: user.id,
        },
      });
    }

    if (variant === "updating") {
      if (!destinationFromCRUD)
        return console.error("Somehow a destination was not passed.");

      await prisma.destination.update({
        where: {
          id: destinationFromCRUD.id,
        },
        data: {
          name: objectif,
          description: contexte,
          userId: user.id,
        },
      });
    }

    revalidatePath(`/users/${username}/destinations`);
  }

  async function deleteDestination(destinationFromCRUD: DestinationFromCRUD) {
    "use server";

    await prisma.destination.delete({
      where: {
        // Cascade will be necessary. To be implemented at the same time as objective and context on Destination model
        id: destinationFromCRUD.id,
      },
    });

    revalidatePath(`/users/${username}/moments`);
  }

  return (
    <CRUD
      destinationsToCRUD={destinationsToCRUD}
      createOrUpdateDestination={createOrUpdateDestination}
      deleteDestination={deleteDestination}
    />
  );
}
