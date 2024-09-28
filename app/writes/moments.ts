import prisma from "@/prisma/db";
// in the end I think this compute should indeed be done the closest from the call as possible
import { endDateAndTime } from "../utilities/moments";
import { dataCreateMomentWithoutDestination } from "./subwrites/moments";
import { whereMomentId } from "../reads/subreads/moments";

// The additions to dataCreateMomentWithoutDestination are sufficiently minuscule to be handled right here instead of finding nonexistant Prisma types that would satisfy them.

export async function createMomentFromFormData(
  activity: string,
  name: string,
  isIndispensable: boolean,
  description: string,
  startDateAndTime: string,
  duration: string,
  destinationId: string,
) {
  const data = Object.assign(
    dataCreateMomentWithoutDestination(
      activity,
      name,
      isIndispensable,
      description,
      startDateAndTime,
      duration,
    ),
    { destinationId },
  );

  return await prisma.moment.create({
    data,
    // previous
    // data: {
    //   activity, // activite
    //   name, // objectif
    //   isIndispensable, // indispensable
    //   description, // contexte
    //   startDateAndTime, // momentDate
    //   duration,
    //   endDateAndTime: endDateAndTime(startDateAndTime, duration),
    //   destinationId, // destinationEntry.id
    // },
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
  const data = Object.assign(
    dataCreateMomentWithoutDestination(
      activity,
      name,
      isIndispensable,
      description,
      startDateAndTime,
      duration,
    ),
    {
      destination: {
        create: {
          name: destinationName, // destination
          userId,
        },
      },
    },
  );

  return await prisma.moment.create({
    data,
    // previous
    // data: {
    //   activity, // activite
    //   name, // objectif
    //   isIndispensable, // indispensable
    //   description, // contexte
    //   startDateAndTime, // momentDate
    //   duration,
    //   endDateAndTime: endDateAndTime(startDateAndTime, duration),
    //   destination: {
    //     create: {
    //       name: destinationName, // destination
    //       userId,
    //     },
    //   },
    // },
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
  const where = whereMomentId(momentId);
  const data = Object.assign(
    dataCreateMomentWithoutDestination(
      activity,
      name,
      isIndispensable,
      description,
      startDateAndTime,
      duration,
    ),
    { destinationId },
  );

  return await prisma.moment.update({
    where,
    data,
    // where: {
    //   id: momentId,
    // },
    // data: {
    //   activity, // activite
    //   name, // objectif
    //   isIndispensable, // indispensable
    //   description, // contexte
    //   startDateAndTime, // momentDate
    //   duration,
    //   endDateAndTime: endDateAndTime(startDateAndTime, duration),
    //   destinationId, // destinationEntry.id
    // },
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
  const where = whereMomentId(momentId);
  const data = Object.assign(
    dataCreateMomentWithoutDestination(
      activity,
      name,
      isIndispensable,
      description,
      startDateAndTime,
      duration,
    ),
    {
      destination: {
        create: {
          name: destinationName, // destination
          userId,
        },
      },
    },
  );

  return await prisma.moment.update({
    where,
    data,
    // where: {
    //   id: momentId,
    // },
    // data: {
    //   activity, // activite
    //   name, // objectif
    //   isIndispensable, // indispensable
    //   description, // contexte
    //   startDateAndTime, // momentDate
    //   duration,
    //   endDateAndTime: endDateAndTime(startDateAndTime, duration),
    //   destination: {
    //     create: {
    //       name: destinationName, // destination
    //       userId,
    //     },
    //   },
    // },
  });
}

export async function deleteMomentByMomentId(momentId: string) {
  const where = whereMomentId(momentId);

  return await prisma.moment.delete({
    where,
  });
}
