import { revalidatePath } from "next/cache";

import { Moment } from "@prisma/client";

import prisma from "@/prisma/db";
import { CRUD } from "./crud";

type StepFromCRUD = {
  id: number;
  intitule: string;
  details: string;
  duree: string;
};

type MomentFromCRUD = {
  id: string;
  destination: string;
  activite: string;
  objectif: string;
  indispensable: boolean;
  contexte: string;
  dateetheure: string;
  etapes: StepFromCRUD[];
};

export default async function MomentsPage() {
  const user = await prisma.user.findUnique({
    where: {
      signInEmailAddress: "l@l.me",
    },
  });
  // console.log(user);

  if (!user) return console.error("Somehow a user was not found.");

  const userMoments = await prisma.moment.findMany({
    where: {
      destination: {
        userId: user.id,
      },
    },
    include: {
      destination: true,
      steps: {
        orderBy: {
          orderId: "asc",
        },
      },
    },
  });
  // console.log(userMoments);

  const momentsToCRUD: MomentFromCRUD[] = userMoments.map((e) => {
    return {
      id: e.id,
      destination: e.destination.name,
      activite: e.activity,
      objectif: e.objective,
      indispensable: e.isIndispensable,
      contexte: e.context,
      dateetheure: e.dateAndTime,
      etapes: e.steps.map((e2) => {
        return {
          id: e2.orderId,
          intitule: e2.title,
          details: e2.details,
          duree: e2.duration,
        };
      }),
    };
  });
  console.log(momentsToCRUD);

  // Ça a marché. Tout ce qui manque c'est le typage entre fichiers.
  async function createOrUpdateMoment(
    variant: "creating" | "updating",
    indispensable: boolean,
    momentDate: string,
    steps: StepFromCRUD[],
    momentFromCRUD: MomentFromCRUD | undefined,
    formData: FormData,
  ) {
    "use server";

    let destination = formData.get("destination");
    let activite = formData.get("activite");
    let objectif = formData.get("objectif");
    let contexte = formData.get("contexte");

    if (
      typeof destination !== "string" ||
      typeof activite !== "string" ||
      typeof objectif !== "string" ||
      typeof contexte !== "string"
    )
      return console.error(
        "Le formulaire de l'étape n'a pas été correctement renseigné.",
      );

    if (!user) return console.error("Somehow a user was not found.");

    if (variant === "creating") {
      const destinationEntry = await prisma.destination.findUnique({
        where: {
          name_userId: {
            name: destination,
            userId: user.id,
          },
        },
      });

      let moment: Moment;

      if (destinationEntry) {
        moment = await prisma.moment.create({
          data: {
            activity: activite,
            objective: objectif,
            isIndispensable: indispensable,
            context: contexte,
            dateAndTime: momentDate,
            destinationId: destinationEntry.id,
          },
        });
      } else {
        moment = await prisma.moment.create({
          data: {
            activity: activite,
            objective: objectif,
            isIndispensable: indispensable,
            context: contexte,
            dateAndTime: momentDate,
            destination: {
              create: {
                name: destination,
                userId: user.id,
              },
            },
          },
        });
      }

      let i = 1;
      for (const step of steps) {
        await prisma.step.create({
          data: {
            orderId: i,
            title: step.intitule,
            details: step.details,
            duration: step.duree,
            momentId: moment.id,
          },
        });
        i++;
      }
    }

    if (variant === "updating") {
      if (!momentFromCRUD)
        return console.error("Somehow a moment was not passed.");

      const destinationEntry = await prisma.destination.findUnique({
        where: {
          name_userId: {
            name: destination,
            userId: user.id,
          },
        },
      });

      let moment: Moment;

      if (destinationEntry) {
        moment = await prisma.moment.update({
          where: {
            id: momentFromCRUD.id,
          },
          data: {
            activity: activite,
            objective: objectif,
            isIndispensable: indispensable,
            context: contexte,
            dateAndTime: momentDate,
            destinationId: destinationEntry.id,
          },
        });
      } else {
        moment = await prisma.moment.update({
          where: {
            id: momentFromCRUD.id,
          },
          data: {
            activity: activite,
            objective: objectif,
            isIndispensable: indispensable,
            context: contexte,
            dateAndTime: momentDate,
            destination: {
              create: {
                name: destination,
                userId: user.id,
              },
            },
          },
        });
      }

      await prisma.step.deleteMany({
        where: {
          momentId: moment.id,
        },
      });

      let i = 1;
      for (const step of steps) {
        await prisma.step.create({
          data: {
            orderId: i,
            title: step.intitule,
            details: step.details,
            duration: step.duree,
            momentId: moment.id,
          },
        });
        i++;
      }
    }

    revalidatePath("/moments");
  }

  async function deleteMoment(momentFromCRUD: MomentFromCRUD) {
    "use server";

    await prisma.moment.delete({
      where: {
        id: momentFromCRUD.id,
      },
    });
  }

  return (
    <CRUD
      momentsToCRUD={momentsToCRUD}
      createOrUpdateMoment={createOrUpdateMoment}
      deleteMoment={deleteMoment}
    />
  );
}

/* Notes
Connection closed is unrelated to setView("read-moments");
That's actually the issue, it's passing hooks as arguments that trigger the error Connection closed.
*/
