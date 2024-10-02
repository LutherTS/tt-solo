import prisma from "@/prisma/db";

import {
  dataConnectMomentDestination,
  dataCreateMomentDestination,
  dataCreateMomentWithoutDestination,
} from "./subwrites/moments";
import { selectMomentId, whereMomentId } from "../reads/subreads/moments";

// The additions to dataCreateMomentWithoutDestination are sufficiently minuscule to be handled right here in Object.assign instead of finding nonexistant Prisma types that would satisfy them.

// Defaults

const select = selectMomentId;

// Creates

export async function createMomentFromFormData(
  activity: string,
  name: string,
  isIndispensable: boolean,
  description: string,
  startDateAndTime: string,
  duration: string,
  destinationId: string,
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
      userId,
    ),
    { destination: dataConnectMomentDestination(destinationId) },
  );

  return await prisma.moment.create({ select, data });
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
  const select = selectMomentId;
  const data = Object.assign(
    dataCreateMomentWithoutDestination(
      activity,
      name,
      isIndispensable,
      description,
      startDateAndTime,
      duration,
      userId,
    ),
    { destination: dataCreateMomentDestination(destinationName, userId) },
  );

  return await prisma.moment.create({ select, data });
}

// Updates

export async function updateMomentFromFormData(
  activity: string,
  name: string,
  isIndispensable: boolean,
  description: string,
  startDateAndTime: string,
  duration: string,
  destinationId: string,
  momentId: string,
  userId: string,
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
      userId,
    ),
    { destination: dataConnectMomentDestination(destinationId) },
  );

  return await prisma.moment.update({ select, where, data });
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
      userId,
    ),
    { destination: dataCreateMomentDestination(destinationName, userId) },
  );

  return await prisma.moment.update({ select, where, data });
}

// Deletes

export async function deleteMomentByMomentId(momentId: string) {
  const where = whereMomentId(momentId);

  return await prisma.moment.delete({ where });
}