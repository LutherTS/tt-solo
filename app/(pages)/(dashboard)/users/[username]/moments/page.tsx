import { revalidatePath } from "next/cache";

import { Moment } from "@prisma/client";

import prisma from "@/prisma/db";

import { CRUD } from "./crud";
import { dateToInputDatetime, endDateAndTime } from "@/app/utilities/moments";
import { add } from "date-fns";

// the time at rendering as a stable foundation for all time operations
let now = new Date();
// sharing time as string to bypass timezone adaptations
let nowString = dateToInputDatetime(now);
console.log(nowString);

type StepFromCRUD = {
  id: number;
  intitule: string;
  details: string;
  duree: string;
  dateetheure?: string; // calculated
  findateetheure?: string; // calculated
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
  duree: string; // calculated
  findateetheure: string; // calculated
};

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

type MomentsDestinationForCRUD = {
  destinationIdeal: string;
  moments: MomentForCRUD[];
};

type MomentsDateForCRUD = {
  date: string;
  destinations: MomentsDestinationForCRUD[];
};

type UserMomentsForCRUD = {
  dates: MomentsDateForCRUD[];
};

export default async function MomentsPage({
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

  // take and skip randomly implemented below for scalable defaults

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
    orderBy: {
      startDateAndTime: "desc",
    },
    take: 20,
    skip: 0,
  });
  // console.log(userMoments);

  const pastUserMoments = await prisma.moment.findMany({
    where: {
      destination: {
        userId: user.id,
      },
      endDateAndTime: {
        lt: nowString,
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
    orderBy: {
      startDateAndTime: "desc",
    },
    take: 10,
    skip: 0,
  });
  // console.log(pastUserMoments);

  const currentUserMoments = await prisma.moment.findMany({
    where: {
      destination: {
        userId: user.id,
      },
      AND: [
        { startDateAndTime: { lte: nowString } },
        { endDateAndTime: { gte: nowString } },
      ],
    },
    include: {
      destination: true,
      steps: {
        orderBy: {
          orderId: "asc",
        },
      },
    },
    orderBy: {
      startDateAndTime: "asc",
    },
    take: 10,
    skip: 0,
  });
  // console.log(currentUserMoments);

  const futureUserMoments = await prisma.moment.findMany({
    where: {
      destination: {
        userId: user.id,
      },
      startDateAndTime: {
        gt: nowString,
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
    orderBy: {
      startDateAndTime: "asc",
    },
    take: 10,
    skip: 0,
  });
  // console.log(futureUserMoments);

  // This will be optimized in a Promise.all once all queries will be organized in their own folder.
  const allUserMoments = [
    userMoments,
    pastUserMoments,
    currentUserMoments,
    futureUserMoments,
  ];
  // console.log(allUserMoments);

  const allUserMomentsForCRUD: UserMomentsForCRUD[] = allUserMoments.map(
    (e, i) => {
      return {
        dates: [
          ...new Set(e.map((moment) => moment.startDateAndTime.split("T")[0])),
        ].map((e3) => {
          return {
            date: e3,
            destinations: [
              ...new Set(
                e
                  .filter((moment) => moment.startDateAndTime.startsWith(e3))
                  .map((moment) => moment.destination.name),
              ),
            ]
              // organizes destinations per day alphabetically
              .sort((a, b) => {
                const destinationA = a.toLowerCase();
                const destinationB = b.toLowerCase();
                if (destinationA < destinationB) return -1;
                if (destinationB > destinationA) return 1;
                return 0;
                // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#sorting_array_of_objects
              })
              .map((e5) => {
                return {
                  destinationIdeal: e5,
                  moments: e
                    .filter(
                      (moment) =>
                        moment.destination.name === e5 &&
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
                    .map((e6) => {
                      return {
                        id: e6.id,
                        activity: e6.activity,
                        objective: e6.name,
                        isIndispensable: e6.isIndispensable,
                        context: e6.description,
                        startDateAndTime: e6.startDateAndTime,
                        duration: e6.duration,
                        endDateAndTime: e6.endDateAndTime,
                        steps: e6.steps.map((e7) => {
                          return {
                            id: e7.id,
                            orderId: e7.orderId,
                            title: e7.name,
                            details: e7.description,
                            startDateAndTime: e7.startDateAndTime,
                            duration: e7.duration,
                            endDateAndTime: e7.endDateAndTime,
                          };
                        }),
                      };
                    }),
                };
              }),
          };
        }),
      };
    },
  );

  // console.log(allUserMomentsForCRUD);
  // allUserMomentsForCRUD.forEach((e) => console.log(e));
  // console.log(allUserMomentsForCRUD[0]);
  // console.log(allUserMomentsForCRUD[0].dates[0]);

  // IMPORTANT
  // Séparer les moments entre les moments qui ont fini avant maintenant, les moments qui dont le début et la fin inclus maintenant, et les moment qui commencent après maintenant. Il faut aussi en créer un de chaque dans les seeds. (Deux restants.)
  // Et le mieux ce sera de créer les dates avec date-fns. Le passé commence à maintenant moins un mois. Le courant commence maintenant. Le futur commence maintenant plus un mois. Et au lieu de 10, 20, 30 minutes, ce sera 1 heure, (60), 2 heures (120) et 3 heures (180).

  // Du coup le temps va devoir être pris depuis le serveur (donc sur cette page) et passer en propriété au composant client.

  // Ensuite je vais mettre en place l'authentification suivant la vidéo de Delba.
  // Et ensuite peut-être même faire les e-mails de login via React Email (https://react.email/).

  const momentsToCRUD: MomentFromCRUD[] = userMoments.map((e) => {
    const dureedumoment = e.steps
      .reduce((acc, curr) => acc + +curr.duration, 0)
      .toString();

    const map: Map<number, number> = new Map();
    let durationTotal = 0;
    for (let j = 0; j < e.steps.length; j++) {
      durationTotal += +e.steps[j].duration;
      map.set(j, durationTotal);
    }

    return {
      id: e.id,
      destination: e.destination.name,
      activite: e.activity,
      objectif: e.name,
      indispensable: e.isIndispensable,
      contexte: e.description,
      dateetheure: e.startDateAndTime,
      etapes: e.steps.map((e2, i2) => {
        let dateetheuredeletape: string;
        if (i2 === 0) dateetheuredeletape = e.startDateAndTime;
        else
          dateetheuredeletape = endDateAndTime(
            e.startDateAndTime,
            // ! because e.steps and map have the same length
            map.get(i2 - 1)!.toString(),
          );
        let findateetheuredeletape = endDateAndTime(
          e.startDateAndTime,
          // really, so far at least I know what I'm doing here
          map.get(i2)!.toString(),
        );

        return {
          id: e2.orderId,
          intitule: e2.name,
          details: e2.description,
          duree: e2.duration,
          dateetheure: dateetheuredeletape,
          findateetheure: findateetheuredeletape,
        };
      }),
      duree: dureedumoment,
      findateetheure: endDateAndTime(e.startDateAndTime, dureedumoment),
    };
  });
  // console.log(momentsToCRUD);
  // momentsToCRUD.forEach((e) => console.log(e.etapes));

  // The very least I could do before I leave is make my form derelict work with the new database schema.

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
        "Le formulaire du moment n'a pas été correctement renseigné.",
      );

    if (!user) return console.error("Somehow a user was not found.");

    let duration = steps.reduce((acc, curr) => acc + +curr.duree, 0).toString();

    const map: Map<number, number> = new Map();
    let durationTotal = 0;
    for (let j = 0; j < steps.length; j++) {
      durationTotal += +steps[j].duree;
      map.set(j, durationTotal);
    }

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
            name: objectif,
            isIndispensable: indispensable,
            description: contexte,
            startDateAndTime: momentDate,
            duration,
            endDateAndTime: endDateAndTime(momentDate, duration),
            destinationId: destinationEntry.id,
          },
        });
      } else {
        moment = await prisma.moment.create({
          data: {
            activity: activite,
            name: objectif,
            isIndispensable: indispensable,
            description: contexte,
            startDateAndTime: momentDate,
            duration,
            endDateAndTime: endDateAndTime(momentDate, duration),
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
      for (let j = 0; j < steps.length; j++) {
        const step = steps[j];

        await prisma.step.create({
          data: {
            orderId: i,
            name: step.intitule,
            description: step.details,
            startDateAndTime:
              j === 0
                ? momentDate
                : dateToInputDatetime(
                    add(momentDate, { minutes: map.get(j - 1) }),
                  ),
            duration: step.duree,
            endDateAndTime: dateToInputDatetime(
              add(momentDate, { minutes: map.get(j) }),
            ),
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
            name: objectif,
            isIndispensable: indispensable,
            description: contexte,
            startDateAndTime: momentDate,
            duration,
            endDateAndTime: endDateAndTime(momentDate, duration),
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
            name: objectif,
            isIndispensable: indispensable,
            description: contexte,
            startDateAndTime: momentDate,
            duration,
            endDateAndTime: endDateAndTime(momentDate, duration),
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
      for (let j = 0; j < steps.length; j++) {
        const step = steps[j];

        await prisma.step.create({
          data: {
            orderId: i,
            name: step.intitule,
            description: step.details,
            startDateAndTime:
              j === 0
                ? momentDate
                : dateToInputDatetime(
                    add(momentDate, { minutes: map.get(j - 1) }),
                  ),
            duration: step.duree,
            endDateAndTime: dateToInputDatetime(
              add(momentDate, { minutes: map.get(j) }),
            ),
            momentId: moment.id,
          },
        });
        i++;
      }
    }

    revalidatePath(`/users/${username}/moments`);
  }

  async function deleteMoment(momentFromCRUD: MomentFromCRUD) {
    "use server";

    await prisma.moment.delete({
      where: {
        id: momentFromCRUD.id,
      },
    });

    revalidatePath(`/users/${username}/moments`);
  }

  return (
    <CRUD
      momentsToCRUD={momentsToCRUD} // to be removed
      allUserMomentsForCRUD={allUserMomentsForCRUD}
      createOrUpdateMoment={createOrUpdateMoment}
      deleteMoment={deleteMoment}
      now={nowString}
    />
  );
}

/* Notes
Connection closed is unrelated to setView("read-moments");
That's actually the issue, it's passing hooks as arguments that trigger the error Connection closed.
Crossing the server and the client works with onClick too, it just does not have access to the formData.
ALERT! 
If you import something from a file that executes something else, THAT EXECUTE IS GOING TO RUN.
EDIT:
At least in a .js file importing from a page also executes... or something:
return (<CRUD momentsToCRUD={momentsToCRUD} createOrUpdateMoment={createOrUpdateMoment} deleteMoment={deleteMoment} 
SyntaxError: Unexpected token '<' (during npx prisma db seed)
That's why it works fine when importing from a page component because, that component does execute on its own, it is being imported by React and Next.js to be executed by Next.js, not by the file itself.
Previous inline notes:
// OK. If I do it with reduce here, this which is already a O(n^2) is going to be a O(n^3)
// The better solution is to create an object of all the data through a for loop at the moment level, and then assign the accrued data below.
// I can accept O(n^2) because a moment has many steps, but anything beyond that is by no means mandatory.
Ça se trouve je vais même pouvoir mettre en gras l'étape en cours d'un moment actuel. // Non, vu que si quelqu'un est sur la page des moments lors d'un moment, c'est qu'il n'a pas encore commencé le moment.
Penser à mettre un revalidate qui s'effectue automatiquement à chaque fois 5 minutes, du genre 00:00, 00:05, puisque le min d'une étape est de 5 minutes. (Il n'y a pas de step par contre, ce qui n'en donnera aucun rapport.)
J'aimerais avoir les étapes en bulletpoints plutôt qu'en strings., surtout maintenant que j'ai la date de début. // DONE.
Demain : 
- important
- Éditer en-dessous
- Adapter éditer à archiver pour moments passés,
- effacer pour moments en cours.
...En vrai même pas. Pour l'instant je considère qu'on peut toujours modifier un moment a posteriori. C'est uniqueement une fois la fonctionnalité de lancement du moment mise en place qu'on pourra penser à archiver, etc. Pour l'instant, on se limite au CRUD, et il a toute son autorité qu'importe les circonstances.
This is where I stop and, as expected, time is causing a whole slew of issues.
*/
