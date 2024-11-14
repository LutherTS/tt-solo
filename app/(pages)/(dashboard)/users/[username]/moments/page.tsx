import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { notFound } from "next/navigation";

import * as GlobalServerComponents from "@/app/components/server";
import Core from "./server";
import { Option } from "@/app/types/globals";
import {
  UserMomentsToCRUD,
  StepFromCRUD,
  MomentToCRUD,
  MomentFormVariant,
  CreateOrUpdateMomentError,
  CreateOrUpdateMomentSuccess,
  SelectMomentDefault,
} from "@/app/types/moments";
import {
  dateToInputDatetime,
  defineCurrentPage,
  defineMoment,
  defineSubView,
  defineView,
  defineWithViewAndMoment,
} from "@/app/utilities/moments";
import {
  CONTAINS,
  CURRENTUSERMOMENTSPAGE,
  FUTUREUSERMOMENTSPAGE,
  INITIAL_PAGE,
  MOMENTID,
  PASTUSERMOMENTSPAGE,
  SUBVIEW,
  TAKE,
  USERMOMENTSPAGE,
  VIEW,
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
  revalidateMomentsServerFlow,
  createOrUpdateMomentServerFlow,
  deleteMomentServerFlow,
} from "@/app/flows/server/moments";
import { adaptDestinationsForMoment, adaptMoments } from "@/app/adapts/moments";

/* Dummy Form Presenting Data 
Présenter le projet à React Paris Meetup. 
Développement de feature
Faire un formulaire indéniable pour le projet.

De mon point de vue, ce projet a besoin de profiter de son statut de nouveau projet pour partir sur une stack des plus actuelles afin d'avoir non seulement une longueur d'avance sur la compétition, mais aussi d'être préparé pour l'avenir. C'est donc ce que je tiens à démontrer avec cet exercice. 

Réaliser la div d'une étape
S'assurer que chaque étape ait un format qui lui correspond, en l'occurrence en rapport avec le style de la création d'étape.
10 minutes

Implémenter le système de coulissement des étapes
Alors, ça c'est plus pour la fin mais, il s'agit d'utiliser Framer Motion et son composant Reorder pour pouvoir réorganiser les étapes, et même visiblement en changer l'ordre.
20 minutes

Finir de vérifier le formulaire
S'assurer que toutes les fonctionnalités marchent sans problème, avant une future phase de nettoyage de code et de mises en composants.
30 minutes
*/

export const dynamic = "force-dynamic";
// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#dynamic // still sometimes it says static route...

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
    // now lifted to the URL
    [VIEW]?: string;
    [SUBVIEW]?: string;
    [MOMENTID]?: string;
  };
}) {
  // VERY IMPORTANT. PREFER DATE AS A STRING TO AVOID TIMEZONE ISSUES, and in the input datetime-local format to easily interact with forms.
  let now = dateToInputDatetime(new Date());
  console.log({ now });

  // PART READ (a.k.a database calls)

  // params and searchParams are awaited in the RC 2 and in stable Next.js 15
  // this simple line assigns the resolved params promise to the params variable already use in the code
  params = await params;
  searchParams = await searchParams;

  const username = params.username;
  // console.log({ username });

  const userFound = await findUserIdByUsername(username);
  // console.log({ userFound });

  if (!userFound) return notFound();

  // extremely important in order to use user in server actions without null
  const user = userFound;

  const userId = user.id;

  // that is one chill searchParam right here
  const contains = searchParams?.[CONTAINS] || "";
  // console.log({ contains });

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
  // const TAKE = 2; // TAKE is now a moments variable

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

  // ...This is complicated.
  // Eventually, theses promises are likely to be resolved by the client. And, their data can be expected to be adapted by the client.
  // If that's the case, their selects need to be explicit, and typed. Because if they're not, they're passing more data than needed to the client.
  // Additionally and as I've mentioned, in every model in my database, I'll need to have the field key right next after id which will house an encrypted version of the id that I'll be exposed to the client. (I can start thinking this through with Grevents v3 if I want.)
  const [
    userMoments,
    pastUserMoments,
    currentUserMoments,
    futureUserMoments,
  ]: SelectMomentDefault[][] = await Promise.all([
    findUserMomentsWithContains(userId, contains, userMomentsPage),
    findPastUserMomentsWithContains(userId, contains, now, pastUserMomentsPage),
    findCurrentUserMomentsWithContains(
      userId,
      contains,
      now,
      currentUserMomentsPage,
    ),
    findFutureUserMomentsWithContains(
      userId,
      contains,
      now,
      futureUserMomentsPage,
    ),
  ]);
  // console.log({
  //   userMoments,
  //   pastUserMoments,
  //   currentUserMoments,
  //   futureUserMoments,
  // });

  const userDestinations = await findDestinationsByUserId(userId);
  // console.log({ userDestinations });

  // adapting data for the client

  const allUserMoments: SelectMomentDefault[][] = [
    userMoments,
    pastUserMoments,
    currentUserMoments,
    futureUserMoments,
  ];
  // console.log({ allUserMoments });

  const allUserMomentsToCRUD: UserMomentsToCRUD[] = adaptMoments(
    allUserMoments,
    pages,
    totals,
    maxPages,
  );
  // console.logs on demand...

  const destinationOptions: Option[] =
    adaptDestinationsForMoment(userDestinations);
  // console.logs on demand...

  // obtaining and interpreting view, moment and subView

  const uniqueShownSet = new Set<string>();

  allUserMomentsToCRUD.forEach((e) => {
    e.dates.forEach((e2) => {
      e2.destinations.forEach((e3) => {
        e3.moments.forEach((e4) => {
          uniqueShownSet.add(JSON.stringify(e4));
        });
      });
    });
  });

  const uniqueShownMoments = [...uniqueShownSet].map((e) =>
    JSON.parse(e),
  ) as MomentToCRUD[];
  // console.log({ uniqueShownMoments });

  let definedView = defineView(searchParams?.[VIEW]);
  // console.log({ definedView });

  let definedMoment = await defineMoment(
    searchParams?.[MOMENTID],
    uniqueShownMoments,
  );
  // console.log({ definedMoment });

  const { view, moment } = defineWithViewAndMoment(definedView, definedMoment);
  // console.log({ view, moment });

  const subView = defineSubView(searchParams?.[SUBVIEW], allUserMomentsToCRUD);
  // console.log({ subView });

  // PART WRITE (a.k.a. server actions)

  async function createOrUpdateMoment(
    formData: FormData,
    variant: MomentFormVariant,
    startMomentDate: string,
    steps: StepFromCRUD[],
    momentFromCRUD: MomentToCRUD | undefined,
    destinationSelect: boolean,
    activitySelect: boolean,
  ): Promise<CreateOrUpdateMomentError | CreateOrUpdateMomentSuccess> {
    "use server";

    // This is it. The action itself, its barebones, all is created with the component and has its existence entirely connected to the existence of the component. Meanwhile, the action's flow can be used by any other action. The executes that are meant for the server are sharable to any action, instead of having actions shared and dormant at all times inside the live code. (Next.js 15 sort of solves this, but it remains more logical that the actions use on a page should be coming from the page itself, even if the code they use are shared across different pages, and therefore in this case across different actions.)
    return await createOrUpdateMomentServerFlow(
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
  ): Promise<CreateOrUpdateMomentError | CreateOrUpdateMomentSuccess> {
    "use server";

    return await deleteMomentServerFlow(momentFromCRUD, user);
  }

  // insisting on : Promise<void> to keep in sync with the flow
  async function revalidateMoments(): Promise<void> {
    "use server";

    return await revalidateMomentsServerFlow(user);
  }

  // The magic here is that no data directly from the User model ever leaves the server, since the actions reuse the verified User data obtained at the top of the function.
  // However, if the actions were obtained via import in a client component such as the one below, user data would have to be bound directly on the client component itself (which is insecure) or via a separate child server component (perhaps secure, but an exact step for that data) which would also have to pass these actions as props, doing the exact same thing.
  // My mental model on this is the following. With inline server actions, server actions are created and only existing when you visit the page. They're not a /createOrUpdateMoment in your codebase opened at all times, they are only temporarily created once you request the page where they take effect. Therefore, if you are not authenticated on the page, its actions do not even exist since the page return an error before instantiating the actions. So basically, a project with only inline server actions would launch with ZERO exposed APIs.
  return (
    // Placeholder fallback for now. It's worth nothing the fallback for main and this route's loading.tsx are not the same. loading.tsx is for MomentsPage, while this fallback is for the Main component. The fallback obviously does not show since Main is a client component and renders fast enough, but it can be seen in the React Developer Tools.
    <ErrorBoundary
      fallback={
        <GlobalServerComponents.FallbackFlex>
          <p>Une erreur est survenue.</p>
        </GlobalServerComponents.FallbackFlex>
      }
    >
      <Suspense
        fallback={
          <GlobalServerComponents.FallbackFlex>
            <p>Loading...</p>
          </GlobalServerComponents.FallbackFlex>
        }
      >
        <Core
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
          // states lifted to the URL
          view={view}
          subView={subView}
          moment={moment}
        />
      </Suspense>
    </ErrorBoundary>
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
