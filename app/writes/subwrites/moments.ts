import { Prisma } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";

// in the end I decided this compute should indeed be done the closest from the call as possible
import { endDateAndTime } from "@/app/utilities/moments";
import { defaultSaltRounds } from "@/app/data/globals";

// Datas

// Create

export async function dataCreateMomentWithoutDestination(
  activity: string,
  name: string,
  isIndispensable: boolean,
  description: string,
  startDateAndTime: string,
  duration: string,
  userId: string,
): Promise<Prisma.MomentCreateWithoutDestinationInput> {
  const id = uuidv4();
  const key = await bcrypt.hash(id, defaultSaltRounds);

  return {
    id,
    key,
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

export async function dataCreateMomentDestination(
  destinationName: string,
  userId: string,
): Promise<Prisma.DestinationCreateNestedOneWithoutMomentsInput> {
  const id = uuidv4();
  const key = await bcrypt.hash(id, defaultSaltRounds);

  return {
    create: {
      id,
      key,
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
