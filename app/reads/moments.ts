import prisma from "@/prisma/db";

import {
  includeMomentDestinationAndSteps,
  momentsOrderByNameAsc,
  momentsOrderByStartAsc,
  momentsOrderByStartDesc,
  whereByNameAndUserId,
  whereContains,
  whereCurrentMoments,
  whereFutureMoments,
  whereMomentIdAndUserId,
  wherePastMoments,
  whereShownAlongButBeforeMoments,
  whereShownBeforeCurrentMoments,
  whereShownBeforeFutureMoments,
  whereShownBeforePastMoments,
  whereUserMoments,
} from "./subreads/moments";
import { SelectMomentIdNameAndDates } from "../types/moments";

// Counts

export async function countUserMomentsWithContains(
  userId: string,
  contains: string,
) {
  const where = Object.assign(
    whereUserMoments(userId),
    whereContains(contains),
  );

  return await prisma.moment.count({ where });
}

export async function countPastUserMomentsWithContains(
  userId: string,
  contains: string,
  nowString: string,
) {
  const where = Object.assign(
    wherePastMoments(nowString),
    whereUserMoments(userId),
    whereContains(contains),
  );

  return await prisma.moment.count({ where });
}

export async function countPastUserMomentsShownBeforeMoment(
  userId: string,
  nowString: string,
  moment: SelectMomentIdNameAndDates,
) {
  const where = Object.assign(
    wherePastMoments(nowString),
    whereUserMoments(userId),
    // based on findPastUserMomentsWithContains's orderBy
    {
      OR: [
        whereShownBeforePastMoments(moment),
        whereShownAlongButBeforeMoments(moment),
      ],
    },
  );

  return await prisma.moment.count({
    where,
  });
}

export async function countCurrentUserMomentsWithContains(
  userId: string,
  contains: string,
  nowString: string,
) {
  const where = Object.assign(
    whereCurrentMoments(nowString),
    whereUserMoments(userId),
    whereContains(contains),
  );

  return await prisma.moment.count({ where });
}

export async function countCurrentUserMomentsShownBeforeMoment(
  userId: string,
  nowString: string,
  moment: SelectMomentIdNameAndDates,
) {
  const where = Object.assign(
    whereCurrentMoments(nowString),
    whereUserMoments(userId),
    // based on findCurrentUserMomentsWithContains's orderBy
    {
      OR: [
        whereShownBeforeCurrentMoments(moment),
        whereShownAlongButBeforeMoments(moment),
      ],
    },
  );

  return await prisma.moment.count({
    where,
  });
}

export async function countFutureUserMomentsWithContains(
  userId: string,
  contains: string,
  nowString: string,
) {
  const where = Object.assign(
    whereFutureMoments(nowString),
    whereUserMoments(userId),
    whereContains(contains),
  );

  return await prisma.moment.count({ where });
}

export async function countFutureUserMomentsShownBeforeMoment(
  userId: string,
  nowString: string,
  moment: SelectMomentIdNameAndDates,
) {
  const where = Object.assign(
    whereFutureMoments(nowString),
    whereUserMoments(userId),
    // based on findFutureUserMomentsWithContains's orderBy
    {
      OR: [
        whereShownBeforeFutureMoments(moment),
        whereShownAlongButBeforeMoments(moment),
      ],
    },
  );

  return await prisma.moment.count({
    where,
  });
}

// FindManys

export async function findUserMomentsWithContains(
  userId: string,
  contains: string,
  userMomentsPage: number,
  TAKE: number,
) {
  const include = includeMomentDestinationAndSteps;
  const where = Object.assign(
    whereUserMoments(userId),
    whereContains(contains),
  );
  const orderBy = [momentsOrderByStartDesc, momentsOrderByNameAsc];
  const take = TAKE;
  const skip = (userMomentsPage - 1) * TAKE;

  return await prisma.moment.findMany({
    include,
    where,
    orderBy,
    take,
    skip,
  });
}

export async function findPastUserMomentsWithContains(
  userId: string,
  contains: string,
  nowString: string,
  pastUserMomentsPage: number,
  TAKE: number,
) {
  const include = includeMomentDestinationAndSteps;
  const where = Object.assign(
    wherePastMoments(nowString),
    whereUserMoments(userId),
    whereContains(contains),
  );
  const orderBy = [momentsOrderByStartDesc, momentsOrderByNameAsc];
  const take = TAKE;
  const skip = (pastUserMomentsPage - 1) * TAKE;

  return await prisma.moment.findMany({
    include,
    where,
    orderBy,
    take,
    skip,
  });
}

export async function findCurrentUserMomentsWithContains(
  userId: string,
  contains: string,
  nowString: string,
  currentUserMomentsPage: number,
  TAKE: number,
) {
  const include = includeMomentDestinationAndSteps;
  const where = Object.assign(
    whereCurrentMoments(nowString),
    whereUserMoments(userId),
    whereContains(contains),
  );
  const orderBy = [momentsOrderByStartAsc, momentsOrderByNameAsc];
  const take = TAKE;
  const skip = (currentUserMomentsPage - 1) * TAKE;

  return await prisma.moment.findMany({
    include,
    where,
    orderBy,
    take,
    skip,
  });
}

export async function findFutureUserMomentsWithContains(
  userId: string,
  contains: string,
  nowString: string,
  futureUserMomentsPage: number,
  TAKE: number,
) {
  const include = includeMomentDestinationAndSteps;
  const where = Object.assign(
    whereFutureMoments(nowString),
    whereUserMoments(userId),
    whereContains(contains),
  );
  const orderBy = [momentsOrderByStartAsc, momentsOrderByNameAsc];
  const take = TAKE;
  const skip = (futureUserMomentsPage - 1) * TAKE;

  return await prisma.moment.findMany({
    include,
    where,
    orderBy,
    take,
    skip,
  });
}

// FindUniques

export async function findMomentByNameAndUserId(name: string, userId: string) {
  const where = whereByNameAndUserId(name, userId);

  return await prisma.moment.findUnique({
    where,
  });
}

export async function findMomentByIdAndUserId(id: string, userId: string) {
  const where = whereMomentIdAndUserId(id, userId);

  return await prisma.moment.findUnique({
    where,
  });
}
