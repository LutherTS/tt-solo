import prisma from "@/prisma/db";

import {
  includeMomentDestinationAndSteps,
  momentsOrderByStartAsc,
  momentsOrderByStartDesc,
  whereCurrentMoments,
  whereFutureMoments,
  wherePastMoments,
  whereUserMomentsWithContains,
} from "./subreads/moments";

// Let's start by doing a 1:1 of all database calls, and then they'll be subdivided in subreads (subwrites).

// Counts

export async function countUserMomentsWithContains(
  userId: string,
  contains: string,
) {
  const where = whereUserMomentsWithContains(userId, contains);

  return await prisma.moment.count({ where });
}

export async function countPastUserMomentsWithContains(
  userId: string,
  contains: string,
  nowString: string,
) {
  const where = Object.assign(
    whereUserMomentsWithContains(userId, contains),
    wherePastMoments(nowString),
  );

  return await prisma.moment.count({ where });
}

export async function countCurrentUserMomentsWithContains(
  userId: string,
  contains: string,
  nowString: string,
) {
  const where = Object.assign(
    whereUserMomentsWithContains(userId, contains),
    whereCurrentMoments(nowString),
  );

  return await prisma.moment.count({ where });
}

export async function countFutureUserMomentsWithContains(
  userId: string,
  contains: string,
  nowString: string,
) {
  const where = Object.assign(
    whereUserMomentsWithContains(userId, contains),
    whereFutureMoments(nowString),
  );

  return await prisma.moment.count({ where });
}

// FindManys

export async function findUserMomentsWithContains(
  userId: string,
  contains: string,
  userMomentsPage: number,
  TAKE: number,
) {
  const include = includeMomentDestinationAndSteps;
  const where = whereUserMomentsWithContains(userId, contains);
  const orderBy = momentsOrderByStartDesc;
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
    whereUserMomentsWithContains(userId, contains),
    wherePastMoments(nowString),
  );
  const orderBy = momentsOrderByStartDesc;
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
    whereUserMomentsWithContains(userId, contains),
    whereCurrentMoments(nowString),
  );
  const orderBy = momentsOrderByStartAsc;
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
    whereUserMomentsWithContains(userId, contains),
    whereFutureMoments(nowString),
  );
  const orderBy = momentsOrderByStartAsc;
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
