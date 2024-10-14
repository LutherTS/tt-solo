import { Prisma } from "@prisma/client";

// in the end I decided this compute should indeed be done the closest from the call as possible
import { endDateAndTime } from "@/app/utilities/moments";

// Datas

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

export function dataConnectMomentDestination(
  destinationId: string,
): Prisma.DestinationCreateNestedOneWithoutMomentsInput {
  return {
    connect: { id: destinationId },
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
