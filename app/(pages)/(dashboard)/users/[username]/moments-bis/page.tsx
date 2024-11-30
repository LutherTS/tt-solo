// "use server"
// Proposes "use server" to enforce a Server Module.

import { use as utilizeResource } from "react";
import { notFound } from "next/navigation";

import * as AllGlobalAgnosticComponents from "@/app/components/agnostic";

import Core from "./components/server/core";

import {
  StepFromClient,
  MomentFormVariant,
  CreateOrUpdateMomentError,
  CreateOrUpdateMomentSuccess,
  MomentAdapted,
} from "@/app/types/moments";
import { dateToInputDatetime } from "@/app/utilities/moments";
import { momentsPageSearchParamsKeys } from "@/app/constants/moments";
import { findUserIdByUsername } from "@/app/reads/users";
import {
  revalidateMomentsServerFlow,
  createOrUpdateMomentServerFlow,
  deleteMomentServerFlow,
} from "@/app/flows/server/moments";
import {
  fetchMomentFormsDataFlow,
  fetchReadMomentsViewDataFlow,
  fetchViewAndMomentDataFlow,
} from "@/app/flows/fetch/moments";

/* Dummy Form Presenting Data 
Présenter le projet à React Paris Meetup. 
Développement de feature
Faire un formulaire indéniable pour le projet. (nouveau)

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

export const dynamic = "force-dynamic"; // https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#dynamic

export default async function MomentsPage({
  params,
  searchParams,
}: {
  params: {
    username: string;
  };
  searchParams?: {
    [momentsPageSearchParamsKeys.CONTAINS]?: string;
    [momentsPageSearchParamsKeys.USER_ALL_MOMENTS_PAGE]?: string;
    [momentsPageSearchParamsKeys.USER_PAST_MOMENTS_PAGE]?: string;
    [momentsPageSearchParamsKeys.USER_CURRENT_MOMENTS_PAGE]?: string;
    [momentsPageSearchParamsKeys.USER_FUTURE_MOMENTS_PAGE]?: string;
    [momentsPageSearchParamsKeys.VIEW]?: string;
    [momentsPageSearchParamsKeys.SUB_VIEW]?: string;
    [momentsPageSearchParamsKeys.MOMENT_KEY]?: string;
  };
}) {
  let now = dateToInputDatetime(new Date());
  console.log({ now });

  // PART READ (a.k.a database calls)

  params = await params;

  const username = params.username;

  // const userFound = await findUserIdByUsername(username);
  const userFound = utilizeResource(findUserIdByUsername(username)); // "When fetching data in a Server Component, prefer async and await over use. async and await pick up rendering from the point where await was invoked, whereas use re-renders the component after the data is resolved." https://19.react.dev/reference/react/use (More like it just doesn't work in Server Components with a --legacy-peer-deps React 19 setup.)
  // Here's what I will do. For now I'm gonna use use as it is and within the limitations of what it is: a Hook, since that's how the error sees it. It's once use will really work on the server (which can only happen once React 19 is officially both stable and supported), that I'll go out on a limb and will rename it utilizeResource.

  if (!userFound) return notFound();

  const user = userFound;

  // fetches

  const fetchViewAndMomentData = fetchViewAndMomentDataFlow(searchParams, user);

  const fetchReadMomentsViewData = fetchReadMomentsViewDataFlow(
    now,
    user,
    searchParams,
  );

  const fetchMomentFormsData = fetchMomentFormsDataFlow(user);

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
    "use server"; // "use server functions"
    // Proposes "use server functions" to enforce a Server Fonction.
    // On top of modules, "use server functions" would enforce a Server Functions Module.

    return await createOrUpdateMomentServerFlow(
      formData,
      variant,
      startMomentDate,
      steps,
      momentAdapted,
      destinationSelect,
      activitySelect,
      user,
    );
  }

  async function deleteMoment(
    momentAdapted: MomentAdapted | undefined,
  ): Promise<CreateOrUpdateMomentError | CreateOrUpdateMomentSuccess> {
    "use server"; // "use server functions"
    // Proposes "use server functions" to enforce a Server Fonction.

    return await deleteMomentServerFlow(momentAdapted, user);
  }

  async function revalidateMoments(): Promise<void> {
    "use server"; // "use server functions"
    // Proposes "use server functions" to enforce a Server Fonction.

    return await revalidateMomentsServerFlow(user);
  }

  return (
    <AllGlobalAgnosticComponents.ErrorBoundarySuspense>
      <Core
        // time (aligned across server and client for hydration cases)
        now={now}
        // reads as promises
        fetchViewAndMomentData={fetchViewAndMomentData}
        fetchReadMomentsViewData={fetchReadMomentsViewData}
        fetchMomentFormsData={fetchMomentFormsData}
        // writes as Server Functions
        revalidateMoments={revalidateMoments}
        createOrUpdateMoment={createOrUpdateMoment}
        deleteMoment={deleteMoment}
      />
    </AllGlobalAgnosticComponents.ErrorBoundarySuspense>
  );
}
