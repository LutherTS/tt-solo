import { revalidatePath } from "next/cache";

import { Moment } from "@prisma/client";

import prisma from "@/prisma/db";
import { CRUD } from "./crud";

// the time at rendering as a stable foundation for all time operations
const now = new Date();

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
  duree: string;
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

  // IMPORTANT
  // Séparer les moments entre les moments qui ont fini avant maintenant, les moments qui dont le début et la fin inclus maintenant, et les moment qui commencent après maintenant. Il faut aussi en créer un de chaque dans les seeds. (Deux restants.)
  // Et le mieux ce sera de créer les dates avec date-fns. Le passé commence à maintenant moins un mois. Le courant commence maintenant. Le futur commence maintenant plus un mois. Et au lieu de 10, 20, 30 minutes, ce sera 1 heure, (60), 2 heures (120) et 3 heures (180).

  // Du coup le temps va devoir être pris depuis le serveur (donc sur cette page) et passer en propriété au composant client.

  // Ensuite je vais mettre en place l'authentification suivant la vidéo de Delba.
  // Et ensuite peut-être même faire les e-mails de login via React Email (https://react.email/).

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
      duree: e.steps.reduce((acc, curr) => acc + +curr.duration, 0).toString(),
    };
  });
  // console.log(momentsToCRUD);

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

    revalidatePath("/moments");
  }

  return (
    <CRUD
      momentsToCRUD={momentsToCRUD}
      createOrUpdateMoment={createOrUpdateMoment}
      deleteMoment={deleteMoment}
      now={now}
    />
  );
}

/* Notes
Connection closed is unrelated to setView("read-moments");
That's actually the issue, it's passing hooks as arguments that trigger the error Connection closed.
Crossing the server and the client works with onClick too, it just does not have access to the formData.
*/
