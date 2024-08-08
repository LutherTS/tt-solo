import prisma from "@/prisma/db";
import { CRUD } from "./crud";
import { revalidatePath } from "next/cache";

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

  async function createOrUpdateMoment(
    formData: FormData,
    variant: "creating" | "updating",
    indispensable: boolean,
    momentDate: string,
  ) {
    "use server";

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

      if (destinationEntry)
        await prisma.moment.create({
          data: {
            activity: activite,
            objective: objectif,
            isIndispensable: indispensable,
            context: contexte,
            dateAndTime: momentDate,
            destinationId: destinationEntry.id,
          },
        });
      else
        await prisma.moment.create({
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

    revalidatePath("/moments");
  }

  return (
    <CRUD
      momentsToCRUD={momentsToCRUD}
      createOrUpdateMoment={createOrUpdateMoment}
    />
  );
}
