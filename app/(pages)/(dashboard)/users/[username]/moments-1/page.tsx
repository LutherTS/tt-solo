import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ErrorBoundary } from "react-error-boundary";

import Main from "./main";
import { Option } from "@/app/types/globals";
import {
  UserMomentsToCRUD,
  StepFromCRUD,
  MomentToCRUD,
  MomentFormVariant,
  CreateOrUpdateMomentState,
} from "@/app/types/moments";
import {
  dateToInputDatetime,
  defineCurrentPage,
} from "@/app/utilities/moments";
import {
  CONTAINS,
  CURRENTUSERMOMENTSPAGE,
  FUTUREUSERMOMENTSPAGE,
  INITIAL_PAGE,
  PASTUSERMOMENTSPAGE,
  USERMOMENTSPAGE,
} from "@/app/data/moments";
import { findUserIdByUsername } from "@/app/reads/users";
import {
  countCurrentUserMomentsWithContains,
  countFutureUserMomentsWithContains,
  countPastUserMomentsWithContains,
  countUserMomentsWithContains,
  findCurrentUserMomentsWithContains,
  findFutureUserMomentsWithContains,
  findPastUserMomentsWithContains,
  findUserMomentsWithContains,
} from "@/app/reads/moments";
import { findDestinationsByUserId } from "@/app/reads/destinations";
import {
  deleteMomentFlow,
  revalidateMomentsFlow,
  createOrUpdateMomentFlow,
} from "@/app/flows/server/moments";
import { FallbackFlex } from "@/app/components_old";

export const dynamic = "force-dynamic";
// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#dynamic // still it says I'm on a static route...

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
    // adding view now to the URL
    view?: string;
  };
}) {
  // VERY IMPORTANT. PREFER DATE AS A STRING TO AVOID TIMEZONE ISSUES, and in the input datetime-local format to easily interact with forms.
  let now = dateToInputDatetime(new Date());
  console.log({ now });

  // PART READ (a.k.a database calls)

  // params and searchParams are awaited in the RC 2 and in stable Next.js 15
  // this simple line assigns the resolved params promise to the params variable already use in the code
  params = await params;

  const username = params.username;
  // console.log({ username });

  const userFound = await findUserIdByUsername(username);
  // console.log({ userFound });

  if (!userFound) return notFound();

  // extremely important in order to use user in server actions without null
  const user = userFound;

  const userId = user.id;

  searchParams = await searchParams;

  // that is one chill searchParam right here
  const contains = searchParams?.[CONTAINS] || "";

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

  // TAKE is page-dependent here. Therefore the page is where it should remain, so that the maintainer of the page can decide how many moments they want without needing to access the read methods.
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
      INITIAL_PAGE,
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
                  .map((moment) => {
                    return {
                      id: moment.destinationId,
                      destinationIdeal: moment.destination.name,
                    };
                  }),
              ),
            ]
              // organizes destinations per day alphabetically
              .sort((a, b) => {
                const destinationA = a.destinationIdeal.toLowerCase();
                const destinationB = b.destinationIdeal.toLowerCase();
                if (destinationA < destinationB) return -1;
                if (destinationB > destinationA) return 1;
                return 0;
                // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#sorting_array_of_objects
              })
              .map((e5) => {
                return {
                  id: e5.id,
                  destinationIdeal: e5.destinationIdeal,
                  moments: e
                    .filter(
                      (moment) =>
                        moment.destination.name === e5.destinationIdeal &&
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
                        destinationIdeal: e5.destinationIdeal,
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

  // PART WRITE (a.k.a. server actions)

  async function createOrUpdateMoment(
    formData: FormData,
    variant: MomentFormVariant,
    startMomentDate: string,
    steps: StepFromCRUD[],
    momentFromCRUD: MomentToCRUD | undefined,
    destinationSelect: boolean,
    activitySelect: boolean,
  ): Promise<CreateOrUpdateMomentState> {
    "use server";

    // This is it. The action itself, its barebones, all is created with the component and has its existence entirely connected to the existence of the component. Meanwhile, the action's flow can be used by any other action. The executes that are meant for the server are sharable to any action, instead of having actions shared and dormant at all times inside the live code. (Next.js 15 sort of solves this, but it remains more logical that the actions use on a page should be coming from the page itself, even if the code they use are shared across different pages, and therefore in this case across different actions.)
    return await createOrUpdateMomentFlow(
      formData,
      variant,
      startMomentDate,
      steps,
      momentFromCRUD,
      destinationSelect,
      activitySelect,
      user,
    );

    // I need to emphasize what is magical about this, if I'm correct.
    // I don't need to authenticate the user in the action. Why? Because the action does or should not exist if the user is not authenticated. :D
    // And this solves the issue of people saying that yeah, actions are dangerous because they go on the server and they need to be secure, etc... No. If the page is secure, the action is secure. Because the action is created with the page.
    // The key takeaway is, the page handles authentication, the action handles authorization. Each entry point to the server, one by one, now has its own dedicated concern.
  }

  async function deleteMoment(
    momentFromCRUD: MomentToCRUD | undefined,
  ): Promise<CreateOrUpdateMomentState> {
    "use server";

    return await deleteMomentFlow(momentFromCRUD, user);
  }

  // insisting on : Promise<void> to keep in sync with the flow
  async function revalidateMoments(): Promise<void> {
    "use server";

    return await revalidateMomentsFlow(user);
  }

  // The magic here is that no data directly from the User model ever leaves the server, since the actions reuse the verified User data obtained at the top of the function.
  // However, if the actions were obtained via import in a client component such as the one below, user data would have to be bound directly on the client component itself (which is insecure) or via a separate child server component (perhaps secure, but an exact step for that data) which would also have to pass these actions as props, doing the exact same thing.
  // My mental model on this is the following. With inline server actions, server actions are created and only existing when you visit the page. They're not a /createOrUpdateMoment in your codebase opened at all times, they are only temporarily created once you request the page where they take effect. Therefore, if you are not authenticated on the page, its actions do not even exist since the page return an error before instantiating the actions. So basically, a project with only inline server actions would launch with ZERO exposed APIs.
  return (
    // Placeholder fallback for now. It's worth nothing the fallback for main and this route's loading.tsx are not the same. loading.tsx is for MomentsPage, while this fallback is for the Main component. The fallback obviously does not show since Main is a client component and renders fast enough, but it can be seen in the React Developer Tools.
    // <StillServer>
    <ErrorBoundary
      fallback={
        <FallbackFlex>
          <p>Une erreur est survenue.</p>
        </FallbackFlex>
      }
    >
      <Suspense
        fallback={
          <FallbackFlex>
            <p>Loading...</p>
          </FallbackFlex>
        }
      >
        <Main
          // time (aligned across server and client for hydration cases)
          now={now}
          // reads
          allUserMomentsToCRUD={allUserMomentsToCRUD}
          maxPages={maxPages}
          destinationOptions={destinationOptions}
          // writes
          revalidateMoments={revalidateMoments}
          createOrUpdateMoment={createOrUpdateMoment}
          deleteMoment={deleteMoment}
        />
      </Suspense>
    </ErrorBoundary>
    // </StillServer>
  );
}

// function StillServer({ children }: { children: React.ReactNode }) {
//   return <>{children}</>;
// }
// While Next.js allows Server Components to wrap Client Components, Client Components can’t wrap Server Components without converting the entire wrapped portion to run on the client. -- ChatGPT

// Also it is my belief that there shouldn't be ANY Suspense boundary without a parent Error boundary to go along.

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
...
SOLVED:
(I don't understand how inside the action user can be null when I'm returning if it's null in the function. ...Let's have some fun with this for one second. It's because the action can be placed anywhere in the parent function, it doesn't follow the regular flow of creation within the page. I can place it before notFound and the code doesn't break. So do I make it use the argument user created inside parent function, but the action is pretty much created before the user is verified. Maybe if obtaining the user and verify the user was one single action, one flow... That's something I could try.)
*/
