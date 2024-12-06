// "use server";
// Proposes "use server" to enforce a Server Module.

/* IMPORTS */

// Internal imports

// in the end I decided this compute should indeed be done the closest from the call as possible
import { endDateAndTime } from "@/app/utilities/agnostic/moments";

// Types imports

import { Prisma } from "@prisma/client";

/* LOGIC */

// Datas

// Create

export function dataCreateMomentWithoutDestination(
  activity: string,
  name: string,
  isIndispensable: boolean,
  description: string,
  startDateAndTime: string,
  duration: string,
  userId: string,
): Prisma.MomentCreateWithoutDestinationInput {
  return {
    activity, // activite
    name, // objectif
    isIndispensable, // indispensable
    description, // contexte
    startDateAndTime, // momentDate
    duration,
    endDateAndTime: endDateAndTime(startDateAndTime, duration),
    user: {
      connect: {
        id: userId,
      },
    },
  };
}

export function dataCreateMomentDestination(
  destinationName: string,
  userId: string,
): Prisma.DestinationCreateNestedOneWithoutMomentsInput {
  return {
    create: {
      name: destinationName, // destination
      userId,
    },
  };
}

// Connects

export function dataConnectMomentDestination(
  destinationId: string,
): Prisma.DestinationCreateNestedOneWithoutMomentsInput {
  return {
    connect: { id: destinationId },
  };
}
