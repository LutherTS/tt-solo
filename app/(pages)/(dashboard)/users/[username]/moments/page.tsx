import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { notFound } from "next/navigation";

import * as GlobalServerComponents from "@/app/components/server";
import Core from "./server";
import {
  StepFromClient,
  MomentFormVariant,
  CreateOrUpdateMomentError,
  CreateOrUpdateMomentSuccess,
  MomentAdapted,
} from "@/app/types/moments";
import { dateToInputDatetime } from "@/app/utilities/moments";
import {
  CONTAINS,
  CURRENTUSERMOMENTSPAGE,
  FUTUREUSERMOMENTSPAGE,
  MOMENTKEY,
  PASTUSERMOMENTSPAGE,
  SUBVIEW,
  USERMOMENTSPAGE,
  VIEW,
} from "@/app/data/moments";
import { findUserIdByUsername } from "@/app/reads/users";
import {
  revalidateMomentsServerFlow,
  trueCreateOrUpdateMomentServerFlow,
  trueDeleteMomentServerFlow,
} from "@/app/flows/server/moments";
import {
  fetchMomentFormsDataFlow,
  fetchReadMomentsViewDataFlow,
  fetchViewAndMomentDataFlow,
} from "@/app/flows/fetch/moments";

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
    [MOMENTKEY]?: string;
  };
}) {
  // VERY IMPORTANT. PREFER DATE AS A STRING TO AVOID TIMEZONE ISSUES, and in the input datetime-local format to easily interact with forms.
  let now = dateToInputDatetime(new Date());
  console.log({ now });

  // PART READ (a.k.a database calls)

  // params and searchParams are awaited in the RC 2 and in stable Next.js 15
  // this simple line assigns the resolved params promise to the params variable already use in the code
  params = await params; // Eventually it is not the page but its main component that's going to await the params...? Yes. Because there may eventually be part of the page, UI that could be loaded and pre-rendered without the need for the params to have been awaited on the whole page. It's just that for now I voluntarily want the whole page to freeze and not even show anything if there is no user found. Which makes sense. People shouldn't even have any idea what the page is supposed to look like if they're not authenticated.

  const username = params.username;
  // console.log({ username });

  const userFound = await findUserIdByUsername(username);
  // console.log({ userFound });

  if (!userFound) return notFound();

  // extremely important in order to use user in server actions without null
  const user = userFound;

  // fetches

  const fetchViewAndMomentData = fetchViewAndMomentDataFlow(searchParams, user);

  // first directly resolved on the server at this time
  const viewAndMomentData = await fetchViewAndMomentData;

  const fetchReadMomentsViewData = fetchReadMomentsViewDataFlow(
    now,
    user,
    searchParams,
  );

  // first directly resolved on the server at this time
  const readMomentsViewData = await fetchReadMomentsViewData;

  const fetchMomentFormsData = fetchMomentFormsDataFlow(user);

  // first directly resolved on the server at this time
  const momentFormsData = await fetchMomentFormsData;

  // PART WRITE (a.k.a. server actions)

  async function createOrUpdateMoment(
    formData: FormData,
    variant: MomentFormVariant,
    startMomentDate: string,
    steps: StepFromClient[],
    momentAdapted: MomentAdapted | undefined,
    destinationSelect: boolean,
    activitySelect: boolean,
  ): Promise<CreateOrUpdateMomentError | CreateOrUpdateMomentSuccess> {
    "use server";

    // This is it. The action itself, its barebones, all is created with the component and has its existence entirely connected to the existence of the component. Meanwhile, the action's flow can be used by any other action. The executes that are meant for the server are sharable to any action, instead of having actions shared and dormant at all times inside the live code. (Next.js 15 sort of solves this, but it remains more logical that the actions use on a page should be coming from the page itself, even if the code they use are shared across different pages, and therefore in this case across different actions.)
    return await trueCreateOrUpdateMomentServerFlow(
      formData,
      variant,
      startMomentDate,
      steps,
      momentAdapted, // DECODE NEEDED // Done.
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
    momentAdapted: MomentAdapted | undefined,
  ): Promise<CreateOrUpdateMomentError | CreateOrUpdateMomentSuccess> {
    "use server";

    return await trueDeleteMomentServerFlow(
      momentAdapted, // DECODE NEEDED // Done.
      user,
    );
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
          viewAndMomentData={viewAndMomentData}
          readMomentsViewData={readMomentsViewData}
          momentFormsData={momentFormsData}
          // writes
          revalidateMoments={revalidateMoments}
          createOrUpdateMoment={createOrUpdateMoment}
          deleteMoment={deleteMoment}
        />
      </Suspense>
    </ErrorBoundary>
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
...
SOLVED:
(I don't understand how inside the action user can be null when I'm returning if it's null in the function. ...Let's have some fun with this for one second. It's because the action can be placed anywhere in the parent function, it doesn't follow the regular flow of creation within the page. I can place it before notFound and the code doesn't break. So do I make it use the argument user created inside parent function, but the action is pretty much created before the user is verified. Maybe if obtaining the user and verify the user was one single action, one flow... That's something I could try.)

OLD THOUGHTS
// No need to decode here, since this is still based on adapted data that is meant for the client.
// But this needs to change completely. It should not depend on uniqueShownMoments and it's the first thing I should solve tomorrow morning.
// The reason I did this is because I...
// ...OMG this might the first time I use useOptimistic tomorrow!!!!!
// So the reason I did this is because I want the update page to change instantaneously without needing to hit the database. However, I will need to do so here, to hit the database here. It's on the CLIENT that I will instead use useOptimistic so that while the database resolves, I can use the current data and start modifying the form based on current data.
// Then I give to the key of UpdateMomentView a mix of the moment's key and the view so that if at resolve it is the same key and the same view that definedMoment retrieve and land to, the component doesn't get remounted which would destroy the form completion that was done during awaiting.
// None of what I'll be doing here will be visible in my demo nor in my own code. The only way that I'll know so far that it works, is by delaying, through console.logs and by nothing breaking even though useOptimistic is implemented.
// Then I can even go further and directly play with the use hook. ...If I honestly can do this ALL this weekend, that will be all of React 19's relevant hooks being implemented in my project... Before the presentation.
// Imagine. My form will pretty much load instantaneously since even though it's the child of a Client Component, it won't have to wait for the server to fetch the moments of ReadMomentsView. And that could be quasi-true even for the UpdateMomentView.
// And that would allow me to present clearly the benefits of React 19 to my audience.
// Imagine. Imagine if that talk, despite or even thanks to my stuttering, is SO GOOD that it reaches the hear of Guillermo Rauch. Just imagine. Imagine. Dream. ...This is why I need to do this.
// ...
// It won't work though, the useOptimistic I mean, because the data changes are not happening on the same right at a given time.

// function StillServer({ children }: { children: React.ReactNode }) {
//   return <>{children}</>;
// }
// While Next.js allows Server Components to wrap Client Components, Client Components can’t wrap Server Components without converting the entire wrapped portion to run on the client. -- ChatGPT

// Also it is my belief that there shouldn't be ANY Suspense boundary without a parent Error boundary to go along.
*/
