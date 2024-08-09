import prisma from "@/prisma/db";
import { CRUD } from "./crud";
import { revalidatePath } from "next/cache";
import { Dispatch, SetStateAction } from "react";
import { Moment } from "@prisma/client";

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

type ViewFromCRUD = "update-moment" | "create-moment" | "read-moments";

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
      steps: true,
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

  // Ça a marché. Il manque seulement les étapes... Et surtout le typage.
  async function createOrUpdateMoment(
    variant: "creating" | "updating",
    indispensable: boolean,
    momentDate: string,
    steps: StepFromCRUD[],
    formData: FormData,
  ) {
    "use server";

    console.log(variant);
    console.log(indispensable);
    console.log(momentDate);
    console.log(steps);
    console.log(formData);

    // ...
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

    revalidatePath("/moments");
    // setView("read-moments");
    // I'm probably going to need all of my setters because revalidate doesn't seem to reset them at all, only the server data.
    // But since this is about the client I'm really not sure. Especially since usually we just shift to another route with redirect.
  }

  return (
    <CRUD
      momentsToCRUD={momentsToCRUD}
      createOrUpdateMoment={createOrUpdateMoment}
    />
  );
}

/* Notes
Connection closed is unrelated to setView("read-moments");
That's actually the issue, it's passing hooks as arguments that trigger the error Connection closed.
*/
