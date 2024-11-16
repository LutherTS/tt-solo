import prisma from "@/prisma/db";

import {
  orderByMomentsNameAsc,
  orderByMomentsStartAsc,
  orderByMomentsStartDesc,
  selectMomentDefault,
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
import { TAKE } from "../data/moments";

const select = selectMomentDefault;

// Counts

// preemptive renaming to address collision
export async function countUserAllMomentsWithContains(
  userId: string,
  contains: string,
) {
  const where = Object.assign(
    whereUserMoments(userId),
    whereContains(contains),
  );

  return await prisma.moment.count({ where });
}

export async function trueCountUserAllMomentsWithContains(
  userId: string,
  contains: string,
  _nowString: string,
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

// preemptive renaming to address collision
export async function findUserAllMomentsWithContains(
  userId: string,
  contains: string,
  userMomentsPage: number,
) {
  const where = Object.assign(
    whereUserMoments(userId),
    whereContains(contains),
  );
  const orderBy = [orderByMomentsStartDesc, orderByMomentsNameAsc];
  const take = TAKE;
  const skip = Math.max(0, userMomentsPage - 1) * TAKE;

  return await prisma.moment.findMany({
    select,
    where,
    orderBy,
    take,
    skip,
  });
}

export async function trueFindUserAllMomentsWithContains(
  userId: string,
  contains: string,
  _nowString: string,
  userMomentsPage: number,
) {
  const where = Object.assign(
    whereUserMoments(userId),
    whereContains(contains),
  );
  const orderBy = [orderByMomentsStartDesc, orderByMomentsNameAsc];
  const take = TAKE;
  const skip = Math.max(0, userMomentsPage - 1) * TAKE;

  return await prisma.moment.findMany({
    select,
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
) {
  const where = Object.assign(
    wherePastMoments(nowString),
    whereUserMoments(userId),
    whereContains(contains),
  );
  const orderBy = [orderByMomentsStartDesc, orderByMomentsNameAsc];
  const take = TAKE;
  const skip = Math.max(0, pastUserMomentsPage - 1) * TAKE;

  return await prisma.moment.findMany({
    select,
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
) {
  const where = Object.assign(
    whereCurrentMoments(nowString),
    whereUserMoments(userId),
    whereContains(contains),
  );
  const orderBy = [orderByMomentsStartAsc, orderByMomentsNameAsc];
  const take = TAKE;
  const skip = Math.max(0, currentUserMomentsPage - 1) * TAKE;

  return await prisma.moment.findMany({
    select,
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
) {
  const where = Object.assign(
    whereFutureMoments(nowString),
    whereUserMoments(userId),
    whereContains(contains),
  );
  const orderBy = [orderByMomentsStartAsc, orderByMomentsNameAsc];
  const take = TAKE;
  const skip = Math.max(0, futureUserMomentsPage - 1) * TAKE;

  return await prisma.moment.findMany({
    select,
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
    select,
    where,
  });
}
