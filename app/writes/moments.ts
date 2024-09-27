import prisma from "@/prisma/db";
// in the end I think this compute should indeed be done the closest from the call as possible
import { endDateAndTime } from "../utilities/moments";

export async function createMomentFromFormData(
  activity: string,
  name: string,
  isIndispensable: boolean,
  description: string,
  startDateAndTime: string,
  duration: string,
  destinationId: string,
) {
  // const data = whereUserPinnedForSelfAnswersByUserId(id);

  return await prisma.moment.create({
    data: {
      activity, // activite
      name, // objectif
      isIndispensable, // indispensable
      description, // contexte
      startDateAndTime, // momentDate
      duration,
      endDateAndTime: endDateAndTime(startDateAndTime, duration),
      destinationId, // destinationEntry.id
    },
  });
}

export async function createMomentAndDestination(
  activity: string,
  name: string,
  isIndispensable: boolean,
  description: string,
  startDateAndTime: string,
  duration: string,
  destinationName: string,
  userId: string,
) {
  // const data = whereUserPinnedForSelfAnswersByUserId(id);

  return await prisma.moment.create({
    data: {
      activity, // activite
      name, // objectif
      isIndispensable, // indispensable
      description, // contexte
      startDateAndTime, // momentDate
      duration,
      endDateAndTime: endDateAndTime(startDateAndTime, duration),
      destination: {
        create: {
          name: destinationName, // destination
          userId,
        },
      },
    },
  });
}

export async function updateMomentFromFormData(
  activity: string,
  name: string,
  isIndispensable: boolean,
  description: string,
  startDateAndTime: string,
  duration: string,
  destinationId: string,
  momentId: string,
) {
  // const where = whereUserPinnedForSelfAnswersByUserId(id);
  // const data = whereUserPinnedForSelfAnswersByUserId(id);

  return await prisma.moment.update({
    where: {
      id: momentId,
    },
    data: {
      activity, // activite
      name, // objectif
      isIndispensable, // indispensable
      description, // contexte
      startDateAndTime, // momentDate
      duration,
      endDateAndTime: endDateAndTime(startDateAndTime, duration),
      destinationId, // destinationEntry.id
    },
  });
}

export async function updateMomentAndDestination(
  activity: string,
  name: string,
  isIndispensable: boolean,
  description: string,
  startDateAndTime: string,
  duration: string,
  destinationName: string,
  userId: string,
  momentId: string,
) {
  // const where = whereUserPinnedForSelfAnswersByUserId(id);
  // const data = whereUserPinnedForSelfAnswersByUserId(id);

  return await prisma.moment.update({
    where: {
      id: momentId,
    },
    data: {
      activity, // activite
      name, // objectif
      isIndispensable, // indispensable
      description, // contexte
      startDateAndTime, // momentDate
      duration,
      endDateAndTime: endDateAndTime(startDateAndTime, duration),
      destination: {
        create: {
          name: destinationName, // destination
          userId,
        },
      },
    },
  });
}

export async function deleteMomentByMomentId(momentId: string) {
  // const where = whereUserPinnedForSelfAnswersByUserId(id);

  return await prisma.step.delete({
    where: {
      id: momentId,
    },
  });
}
