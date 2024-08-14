import { revalidatePath } from "next/cache";

import { Moment } from "@prisma/client";

import prisma from "@/prisma/db";

import { add } from "date-fns";

import { Option } from "@/app/types/general";
import {
  UserMomentsToCRUD,
  StepFromCRUD,
  MomentToCRUD,
} from "@/app/types/moments";
import { dateToInputDatetime, endDateAndTime } from "@/app/utilities/moments";

import { CRUD } from "./crud";

// IMPORTANT
// Just that weird this about time not being current correctly now.

// the time at rendering as a stable foundation for all time operations
let now = new Date();
// sharing time as string to bypass timezone adaptations
let nowString = dateToInputDatetime(now);
console.log(nowString);
// There's a problem with cache when it comes to time here
// It's only when the page recompiles that the correct time is taken into account. Probably something with noStore, I don't know.

export default async function MomentsPage({
  params,
  searchParams,
}: {
  params: {
    username: string;
  };
  searchParams?: {
    contains?: string;
    usermomentspage?: string;
    pastusermomentspage?: string;
    currentusermomentspage?: string;
    futureusermomentspage?: string;
  };
}) {
  const username = params.username;

  const contains = searchParams?.contains || "";
  const userMomentsPage = Number(searchParams?.usermomentspage) || 1;
  const pastUserMomentsPage = Number(searchParams?.pastusermomentspage) || 1;
  const currentUserMomentsPage =
    Number(searchParams?.currentusermomentspage) || 1;
  const futureUserMomentsPage =
    Number(searchParams?.futureusermomentspage) || 1;

  const user = await prisma.user.findUnique({
    where: { username },
  });
  // console.log(user);

  if (!user) return console.error("Somehow a user was not found.");

  // take and skip randomly implemented below for scalable defaults.
  // All of these will be optimized and organized in their own folders.

  const TAKE = 2;

  const [
    userMomentsTotal,
    pastUserMomentsTotal,
    currentUserMomentsTotal,
    futureUserMomentsTotal,
  ] = await Promise.all([
    prisma.moment.count({
      where: {
        destination: {
          userId: user.id,
        },
        name: {
          contains: contains !== "" ? contains : undefined,
        },
      },
    }),
    prisma.moment.count({
      where: {
        destination: {
          userId: user.id,
        },
        name: {
          contains: contains !== "" ? contains : undefined,
        },
        endDateAndTime: {
          lt: nowString,
        },
      },
    }),
    prisma.moment.count({
      where: {
        destination: {
          userId: user.id,
        },
        name: {
          contains: contains !== "" ? contains : undefined,
        },
        AND: [
          { startDateAndTime: { lte: nowString } },
          { endDateAndTime: { gte: nowString } },
        ],
      },
    }),
    prisma.moment.count({
      where: {
        destination: {
          userId: user.id,
        },
        name: {
          contains: contains !== "" ? contains : undefined,
        },
        startDateAndTime: {
          gt: nowString,
        },
      },
    }),
  ]);
  // console.log({
  //   userMomentsTotal,
  //   pastUserMomentsTotal,
  //   currentUserMomentsTotal,
  //   futureUserMomentsTotal,
  // });

  const totals = [
    userMomentsTotal,
    pastUserMomentsTotal,
    currentUserMomentsTotal,
    futureUserMomentsTotal,
  ];

  const maxPages = totals.map((e) => Math.ceil(e / TAKE));
  console.log(maxPages);

  const [userMoments, pastUserMoments, currentUserMoments, futureUserMoments] =
    await Promise.all([
      prisma.moment.findMany({
        where: {
          destination: {
            userId: user.id,
          },
          name: {
            contains: contains !== "" ? contains : undefined,
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
        take: TAKE,
        skip: (userMomentsPage - 1) * TAKE,
      }),
      prisma.moment.findMany({
        where: {
          destination: {
            userId: user.id,
          },
          name: {
            contains: contains !== "" ? contains : undefined,
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
        take: TAKE,
        skip: (pastUserMomentsPage - 1) * TAKE,
      }),
      prisma.moment.findMany({
        where: {
          destination: {
            userId: user.id,
          },
          name: {
            contains: contains !== "" ? contains : undefined,
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
        take: TAKE,
        skip: (currentUserMomentsPage - 1) * TAKE,
      }),
      prisma.moment.findMany({
        where: {
          destination: {
            userId: user.id,
          },
          name: {
            contains: contains !== "" ? contains : undefined,
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
        take: TAKE,
        skip: (futureUserMomentsPage - 1) * TAKE,
      }),
    ]);
  // console.log(userMoments);
  // console.log(pastUserMoments);
  // console.log(currentUserMoments);
  // console.log(futureUserMoments);

  const allUserMoments = [
    userMoments,
    pastUserMoments,
    currentUserMoments,
    futureUserMoments,
  ];
  // console.log(allUserMoments);

  const allUserMomentsToCRUD: UserMomentsToCRUD[] = allUserMoments.map((e) => {
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
                      destinationIdeal: e5,
                    };
                  }),
              };
            }),
        };
      }),
    };
  });

  const userDestinations = await prisma.destination.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  const destinationOptions: Option[] = userDestinations
    .sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (nameA < nameB) return -1;
      if (nameB > nameA) return 1;
      return 0;
    })
    .map((e, i) => {
      return {
        key: i + 1,
        label: e.name,
        value: e.name,
      };
    });

  // Ça a marché. Tout ce qui manque c'est le typage entre fichiers.
  async function createOrUpdateMoment(
    variant: "creating" | "updating",
    indispensable: boolean,
    momentDate: string,
    steps: StepFromCRUD[],
    momentFromCRUD: MomentToCRUD | undefined,
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

  async function deleteMoment(momentFromCRUD: MomentToCRUD) {
    "use server";

    await prisma.moment.delete({
      where: {
        id: momentFromCRUD.id,
      },
    });

    revalidatePath(`/users/${username}/moments`);
  }

  async function revalidateMoments() {
    "use server";

    revalidatePath(`/users/${username}/moments`);
  }

  return (
    <CRUD
      allUserMomentsToCRUD={allUserMomentsToCRUD}
      destinationOptions={destinationOptions}
      maxPages={maxPages}
      createOrUpdateMoment={createOrUpdateMoment}
      deleteMoment={deleteMoment}
      revalidateMoments={revalidateMoments}
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
TÂCHES FUTURES
...
Ensuite je vais mettre en place l'authentification suivant la vidéo de Delba.
Et ensuite peut-être même faire les e-mails de login via React Email (https://react.email/).
*/
