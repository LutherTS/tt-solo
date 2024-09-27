import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { Moment } from "@prisma/client";
import { add } from "date-fns";

import prisma from "@/prisma/db";
import { Option } from "@/app/types/globals";
import {
  UserMomentsToCRUD,
  StepFromCRUD,
  MomentToCRUD,
  CreateOrUpdateMomentState,
  DeleteMomentState,
} from "@/app/types/moments";
import {
  dateToInputDatetime,
  defineCurrentPage,
  endDateAndTime,
} from "@/app/utilities/moments";
import { CRUD } from "./crud";
import {
  CONTAINS,
  CURRENTUSERMOMENTSPAGE,
  FUTUREUSERMOMENTSPAGE,
  PASTUSERMOMENTSPAGE,
  USERMOMENTSPAGE,
} from "@/app/variables/moments";

export const dynamic = "force-dynamic";
// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#dynamic

/*
// IMPORTANT
// Just that weird thing about time not being current correctly now.
// Either something to do with cache or the need for a useEffect.
// (Which I'm now trying to address above with export const dynamic.)
// (I'll need to test more but I think "force-dynamic" got things done.)

// the time at rendering as a stable foundation for all time operations
let now = new Date();
// sharing time as string to bypass timezone adaptations
let nowString = dateToInputDatetime(now);
console.log(nowString);
// There's a problem with cache when it comes to time here
// It's only when the page recompiles that the correct time is taken into account. Probably something with noStore, I don't know.

// FLASH NOTE
// I don't know though why I did not include now in the MomentsPage function. (Actually it wasn't supposed to be this way.)
*/

export default async function MomentsPage({
  params,
  searchParams,
}: {
  params: {
    username: string;
  };
  searchParams?: {
    [CONTAINS]?: string;
    [USERMOMENTSPAGE]?: string;
    [PASTUSERMOMENTSPAGE]?: string;
    [CURRENTUSERMOMENTSPAGE]?: string;
    [FUTUREUSERMOMENTSPAGE]?: string;
  };
}) {
  let now = new Date();
  let nowString = dateToInputDatetime(now);
  console.log(nowString);

  const username = params.username;

  // PART READ

  const user = await prisma.user.findUnique({
    where: { username },
  });
  // console.log(user);

  if (!user) return notFound();

  // that is one chill searchParam right here
  const contains = searchParams?.[CONTAINS] || "";

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
  // console.log(totals)

  // take and skip randomly implemented below for scalable defaults.
  // All of these will be optimized and organized in their own folders.

  const TAKE = 2;

  const maxPages = totals.map((e) => Math.ceil(e / TAKE));
  // console.log(maxPages);

  let [
    initialUserMomentsPage,
    initialPastUserMomentsPage,
    initialCurrentUserMomentsPage,
    initialFutureUserMomentsPage,
  ] = [1, 1, 1, 1];

  // it's a solution but I guess tomorrow I could optimize
  // I could also start (finally?) making them actions folder and files
  // ...and maybe even them data folder and files, too
  // though I really like having both read and write here on the same file...
  // ...so I could instead make their helpers in a brand-new folder
  // like reads and writes
  // the actions and the full read flows will stay here but deconstructed.
  // ...
  // I think does make sense that the reads are on the server and the writes are on the client. That can justifying placing server actions in the own folders which, to be honest, is exactly how I would work with a team.
  let pages = [
    initialUserMomentsPage,
    initialPastUserMomentsPage,
    initialCurrentUserMomentsPage,
    initialFutureUserMomentsPage,
  ];

  let pagesViaObjects = [
    { key: USERMOMENTSPAGE, value: initialUserMomentsPage },
    { key: PASTUSERMOMENTSPAGE, value: initialPastUserMomentsPage },
    { key: CURRENTUSERMOMENTSPAGE, value: initialCurrentUserMomentsPage },
    { key: FUTUREUSERMOMENTSPAGE, value: initialFutureUserMomentsPage },
  ];

  pages = pages.map((e, i) => {
    return defineCurrentPage(
      e,
      // I had never seen that TypeScript syntax before.
      // And it is not valid JavaScript.
      Number(searchParams?.[pagesViaObjects[i].key]),
      maxPages[i],
    );
  });

  const [
    userMomentsPage,
    pastUserMomentsPage,
    currentUserMomentsPage,
    futureUserMomentsPage,
  ] = pages;
  // console.log({ pages });

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

  const allUserMomentsToCRUD: UserMomentsToCRUD[] = allUserMoments.map(
    (e, i, a) => {
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
            momentsTotal: a[i].length,
            momentFirstIndex: (pages[i] - 1) * TAKE + 1,
            momentLastIndex: (pages[i] - 1) * TAKE + a[i].length,
            allMomentsTotal: totals[i],
            currentPage: pages[i],
            totalPage: maxPages[i],
          };
        }),
      };
    },
  );

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

  // PART WRITE

  // Making progress on shared types.

  // Ça a marché. Tout ce qui manque c'est le typage entre fichiers.
  // (Typage dorénavant transposer à la main. ...Et plus encore.)
  async function createOrUpdateMoment(
    variant: "creating" | "updating",
    indispensable: boolean,
    momentDate: string,
    steps: StepFromCRUD[],
    momentFromCRUD: MomentToCRUD | undefined,
    formData: FormData,
  ): Promise<CreateOrUpdateMomentState> {
    "use server";

    // test
    // return { message: "I'm testing things here." };
    // It works and with that, I now know my way around useTransition.

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
      // return console.error(
      //   "Le formulaire du moment n'a pas été correctement renseigné.",
      // );
      return {
        message: "Le formulaire du moment n'a pas été correctement renseigné.",
      };

    // For this reason below alone I thing actions should be nested and passed as props instead of housed inside dedicated files. Here, this means data from the user literally never makes it to the client. Sensitive data from a user database entry (and even insensitive data) never even reaches any outside computer. Not even the user's id.
    // So what should be in separated files are not the actions, but rather the methods that make the action, which therefore can be used in any action. The methods should be the commonalities, not the actions themselves.

    if (!user)
      // return console.error("Surprenamment un utilisateur n'a pas été retrouvé.");
      return { message: "Surprenamment un utilisateur n'a pas été retrouvé." };

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
        // return console.error("Surprenamment un moment n'a pas été réceptionné.");
        return { message: "Surprenamment un moment n'a pas été réceptionné." };

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

  async function deleteMoment(
    momentFromCRUD?: MomentToCRUD,
  ): Promise<DeleteMomentState> {
    "use server";

    if (!momentFromCRUD)
      // return console.error("Surprenamment un moment n'a pas été réceptionné.");
      return { message: "Surprenamment un moment n'a pas été réceptionné." };

    await prisma.moment.delete({
      where: {
        id: momentFromCRUD.id,
      },
    });

    revalidatePath(`/users/${username}/moments`);
  }

  // still bugging with time, at this time... not anymore?
  // there no return in any case here so there's no need in typing : Promise<void>
  async function revalidateMoments() {
    "use server";

    revalidatePath(`/users/${username}/moments`);
  }

  // The magic here is that no data directly from the User model ever leaves the server, since the actions reuse the verified User data obtained at the top of the function.
  // However, if the actions were obtained via import in a client component such as the one below, user data would have to be bound directly on the client component itself (which is insecure) or via a separate child server component (perhaps secure, but an exact step for that data) which would also have to pass these actions as props, doing the exact same thing.
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
// The better solution is to create an object of all the data through a for loop at the Moment level, and then assign the accrued data below.
// I can accept O(n^2) because a moment has many steps, but anything beyond that is by no means mandatory.
...
In the end... It's better my code stays the same when it comes to durations, startDateAndTimes and endDateAndTimes. I know these are essentially computed fields. But if they have be computed every time I access the data, it's immensely slower if they're only computed on every insert and every update. 
...
Now aside from validations the only thing I'm missing from my server actions is a good old try...catch for the unexpected errors I simply could not be held responsible for. (Those I'm unlikely to encounter locally.)
...
// There is no way that code is a thing.
// truePages = [
//   userMomentsPage,
//   pastUserMomentsPage,
//   currentUserMomentsPage,
//   futureUserMomentsPage,
// ] = truePages;
*/
