import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { Prisma } from "@prisma/client";

// import prisma from "@/prisma/db"; // proudly commented out
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
  // endDateAndTime, // now closer to compute
} from "@/app/utilities/moments";
import { CRUD } from "./crud";
import {
  CONTAINS,
  CURRENTUSERMOMENTSPAGE,
  FUTUREUSERMOMENTSPAGE,
  PASTUSERMOMENTSPAGE,
  USERMOMENTSPAGE,
} from "@/app/variables/moments";
import { findUserIdByUsername } from "@/app/reads/users";
import {
  countCurrentUserMomentsWithContains,
  countFutureUserMomentsWithContains,
  countPastUserMomentsWithContains,
  countUserMomentsWithContains,
  findCurrentUserMomentsWithContains,
  findFutureUserMomentsWithContains,
  findMomentByNameAndUserId,
  findPastUserMomentsWithContains,
  findUserMomentsWithContains,
} from "@/app/reads/moments";
import {
  findDestinationIdByNameAndUserId,
  findDestinationsByUserId,
} from "@/app/reads/destinations";
import {
  createMomentAndDestination,
  createMomentFromFormData,
  deleteMomentByMomentId,
  updateMomentAndDestination,
  updateMomentFromFormData,
} from "@/app/writes/moments";
import { deleteMomentStepsByMomentId } from "@/app/writes/steps";
import { selectMomentId } from "@/app/reads/subreads/moments";
import { createStepsFromStepsFlow } from "@/app/utilities/steps";

export const dynamic = "force-dynamic";
// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#dynamic

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
  // VERY IMPORTANT. PREFER DATE AS A STRING TO AVOID TIMEZONE ISSUES, and in the input datetime-local format to easily interact with forms.
  let now = dateToInputDatetime(new Date());
  console.log({ now });

  // PART READ

  const username = params.username;

  // error handling needed eventually
  const user = await findUserIdByUsername(username);
  // console.log({ user });

  if (!user) return notFound();

  const userId = user.id;

  // that is one chill searchParam right here
  const contains = searchParams?.[CONTAINS] || "";

  // error handling needed eventually
  const [
    userMomentsTotal,
    pastUserMomentsTotal,
    currentUserMomentsTotal,
    futureUserMomentsTotal,
  ] = await Promise.all([
    countUserMomentsWithContains(userId, contains),
    countPastUserMomentsWithContains(userId, contains, now),
    countCurrentUserMomentsWithContains(userId, contains, now),
    countFutureUserMomentsWithContains(userId, contains, now),
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
  ] as const;
  // console.log({ totals })

  // TAKE is page-dependent here. So the page is where it should remain, so that the maintainer of the page can decide how many moments they want without needing to access the read methods.
  const TAKE = 2;

  const maxPages = totals.map((e) => Math.ceil(e / TAKE));
  // console.log({ maxPages });

  const searchParamsPageKeys = [
    USERMOMENTSPAGE,
    PASTUSERMOMENTSPAGE,
    CURRENTUSERMOMENTSPAGE,
    FUTUREUSERMOMENTSPAGE,
  ] as const;

  const pages = searchParamsPageKeys.map((e, i) =>
    defineCurrentPage(
      1,
      // I had never seen that TypeScript syntax before.
      // And it is not valid JavaScript.
      Number(searchParams?.[e]),
      maxPages[i],
    ),
  );
  // console.log({ pages });

  const [
    userMomentsPage,
    pastUserMomentsPage,
    currentUserMomentsPage,
    futureUserMomentsPage,
  ] = pages;

  // error handling needed eventually
  const [userMoments, pastUserMoments, currentUserMoments, futureUserMoments] =
    await Promise.all([
      findUserMomentsWithContains(userId, contains, userMomentsPage, TAKE),
      findPastUserMomentsWithContains(
        userId,
        contains,
        now,
        pastUserMomentsPage,
        TAKE,
      ),
      findCurrentUserMomentsWithContains(
        userId,
        contains,
        now,
        currentUserMomentsPage,
        TAKE,
      ),
      findFutureUserMomentsWithContains(
        userId,
        contains,
        now,
        futureUserMomentsPage,
        TAKE,
      ),
    ]);
  // console.log({
  //   userMoments,
  //   pastUserMoments,
  //   currentUserMoments,
  //   futureUserMoments,
  // });

  const allUserMoments = [
    userMoments,
    pastUserMoments,
    currentUserMoments,
    futureUserMoments,
  ];
  // console.log({ allUserMoments });

  // treating data for the client...
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
  // console.logs on demand...

  // error handling needed eventually
  const userDestinations = await findDestinationsByUserId(userId);
  // console.log({ userDestinations });

  // treating data for the client...
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
  // console.logs on demand...

  // PART WRITE

  // Types are shared between this server file, the type file and the client file, manually verified both for the arguments and for the promise.
  async function createOrUpdateMoment(
    variant: "creating" | "updating",
    indispensable: boolean,
    momentDate: string,
    steps: StepFromCRUD[],
    destination: string,
    activite: string,
    objectif: string,
    contexte: string,
    momentFromCRUD: MomentToCRUD | undefined,
  ): Promise<CreateOrUpdateMomentState> {
    "use server";

    // testing...
    // return { message: "I'm testing things here." };
    // It works and with that, I now know my way around useTransition.

    // destination, activite, objectif and contexte are now controlled
    if (
      typeof destination !== "string" ||
      typeof activite !== "string" ||
      typeof objectif !== "string" ||
      typeof contexte !== "string"
    )
      return {
        message: "Le formulaire du moment n'a pas été correctement renseigné.",
      };

    // For this reason below alone I thing actions should be inline and passed as props instead of housed inside dedicated files. Here, this means data from the user literally never makes it to the client. Sensitive data from a user database entry (and even insensitive data) never even reaches any outside computer. Not even the user's id.
    // So what should be in separated files are not the actions, but rather the methods that make the action, which therefore can be used in any action. The methods should be the commonalities, not the actions themselves. Actions can and I believe should be directly link to the actual pages where they're meant to be triggered, like temporary APIs only available within their own contexts.

    if (!user)
      return { message: "Surprenamment un utilisateur n'a pas été retrouvé." };

    let duration = steps.reduce((acc, curr) => acc + +curr.duree, 0).toString();

    const map: Map<number, number> = new Map();
    let durationTotal = 0;
    for (let j = 0; j < steps.length; j++) {
      durationTotal += +steps[j].duree;
      map.set(j, durationTotal);
    }

    if (variant === "creating") {
      const preexistingMoment = await findMomentByNameAndUserId(
        objectif,
        userId,
      );

      if (preexistingMoment)
        return { message: "Vous avez déjà un moment de ce même nom." };
      // It worked... But then the form reset.
      // https://github.com/facebook/react/issues/29034
      // That's where we're considering going back to Remix.
      // Or I'm basically going to have to control every single field (they're only four so it's okayish), and send their data from the controlled output. This is so dumb but hey, that's what you get from living dangerously.
      // Done. I've just controlled every single field.

      // That's a duplicate with "updating", but "updating" begins different. I insist on having both flows in their single if statements.
      // error handling needed eventually
      const destinationEntry = await findDestinationIdByNameAndUserId(
        destination,
        userId,
      );

      let moment: Prisma.MomentGetPayload<{
        select: typeof selectMomentId;
      }>;

      if (destinationEntry) {
        const destinationId = destinationEntry.id;

        // error handling needed eventually
        moment = await createMomentFromFormData(
          activite,
          objectif,
          indispensable,
          contexte,
          momentDate,
          duration,
          destinationId,
          userId,
        );
      } else {
        // error handling needed eventually
        moment = await createMomentAndDestination(
          activite,
          objectif,
          indispensable,
          contexte,
          momentDate,
          duration,
          destination,
          userId,
        );
      }

      const momentId = moment.id;

      await createStepsFromStepsFlow(steps, momentDate, map, momentId);
    }

    if (variant === "updating") {
      if (!momentFromCRUD)
        return { message: "Surprenamment un moment n'a pas été réceptionné." };

      let momentId = momentFromCRUD.id;

      // error handling needed eventually
      const destinationEntry = await findDestinationIdByNameAndUserId(
        destination,
        userId,
      );

      let moment: Prisma.MomentGetPayload<{
        select: typeof selectMomentId;
      }>;

      if (destinationEntry) {
        const destinationId = destinationEntry.id;

        // error handling needed eventually
        moment = await updateMomentFromFormData(
          activite,
          objectif,
          indispensable,
          contexte,
          momentDate,
          duration,
          destinationId,
          momentId,
          userId,
        );
      } else {
        // error handling needed eventually
        moment = await updateMomentAndDestination(
          activite,
          objectif,
          indispensable,
          contexte,
          momentDate,
          duration,
          destination,
          userId,
          momentId,
        );
      }

      momentId = moment.id;

      // error handling needed eventually
      await deleteMomentStepsByMomentId(momentId);

      await createStepsFromStepsFlow(steps, momentDate, map, momentId);
    }

    revalidatePath(`/users/${username}/moments`);
  }

  async function deleteMoment(
    momentFromCRUD?: MomentToCRUD,
  ): Promise<DeleteMomentState> {
    "use server";

    if (!momentFromCRUD)
      return { message: "Surprenamment un moment n'a pas été réceptionné." };

    const momentId = momentFromCRUD.id;

    // error handling needed eventually
    await deleteMomentByMomentId(momentId);

    revalidatePath(`/users/${username}/moments`);
  }

  // there's no return in any case so no need in typing ": Promise<void>"
  async function revalidateMoments() {
    "use server";

    revalidatePath(`/users/${username}/moments`);
  }

  // The magic here is that no data directly from the User model ever leaves the server, since the actions reuse the verified User data obtained at the top of the function.
  // However, if the actions were obtained via import in a client component such as the one below, user data would have to be bound directly on the client component itself (which is insecure) or via a separate child server component (perhaps secure, but an exact step for that data) which would also have to pass these actions as props, doing the exact same thing.
  // My mental model on this is the following. With inline server actions, server actions are created and only existing when you visit the page. They're not a /createOrUpdateMoment in your codebase opened at all times, they are only temporarily created once you request the page where they take effect. Therefore, if you are not authenticated on the page, its actions do not even exist since the page return an error before instantiating the actions. So basically, a project with only inline server actions would launch with ZERO exposed APIs.
  return (
    <CRUD
      allUserMomentsToCRUD={allUserMomentsToCRUD}
      destinationOptions={destinationOptions}
      maxPages={maxPages}
      createOrUpdateMoment={createOrUpdateMoment}
      deleteMoment={deleteMoment}
      revalidateMoments={revalidateMoments}
      now={now}
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
...
// it's a solution but I guess tomorrow I could optimize
// I could also start (finally?) making them actions folder and files
// ...and maybe even them data folder and files, too
// though I really like having both read and write here on the same file...
// ...so I could instead make their helpers in a brand-new folder
// like reads and writes
// the actions and the full read flows will stay here but deconstructed.
// ...
// I think does make sense that the reads are on the server and the writes are on the client. That can justifying placing server actions in the own folders which, to be honest, is exactly how I would work with a team.
*/
