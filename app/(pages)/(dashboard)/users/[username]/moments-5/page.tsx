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

  const userFound = await findUserIdByUsername(username);

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
    "use server";

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
    "use server";

    return await deleteMomentServerFlow(momentAdapted, user);
  }

  async function revalidateMoments(): Promise<void> {
    "use server";

    return await revalidateMomentsServerFlow(user);
  }

  return (
    // SUSPENDED
    <GlobalServerComponents.ErrorBoundarySuspense>
      <Core
        // time (aligned across server and client for hydration cases)
        now={now}
        // reads as promises
        fetchViewAndMomentData={fetchViewAndMomentData}
        fetchReadMomentsViewData={fetchReadMomentsViewData}
        fetchMomentFormsData={fetchMomentFormsData}
        // writes
        revalidateMoments={revalidateMoments}
        createOrUpdateMoment={createOrUpdateMoment}
        deleteMoment={deleteMoment}
      />
    </GlobalServerComponents.ErrorBoundarySuspense>
  );
}