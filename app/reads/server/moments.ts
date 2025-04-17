// no directive
// Proposes no directive to enforce a Server Module.

/* IMPORTS */

// Internal imports

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
import { TAKE } from "@/app/constants/agnostic/moments";

// Types imports

import type { SelectMomentIdNameAndDates } from "@/app/types/server/moments";

/* LOGIC */

const select = selectMomentDefault;

// Counts

export async function falseCountUserAllMomentsWithContains(
  userId: string,
  contains: string,
) {
  // const where = Object.assign(
  //   whereUserMoments(userId),
  //   whereContains(contains),
  // );
  const where = {
    ...whereUserMoments(userId),
    ...whereContains(contains),
  };

  return await prisma.moment.count({ where });
}

export async function countUserAllMomentsWithContains(
  userId: string,
  contains: string,
  _nowString: string,
) {
  // const where = Object.assign(
  //   whereUserMoments(userId),
  //   whereContains(contains),
  // );
  const where = {
    ...whereUserMoments(userId),
    ...whereContains(contains),
  };

  return await prisma.moment.count({ where });
}

export async function countUserPastMomentsWithContains(
  userId: string,
  contains: string,
  nowString: string,
) {
  // const where = Object.assign(
  //   wherePastMoments(nowString),
  //   whereUserMoments(userId),
  //   whereContains(contains),
  // );
  const where = {
    ...wherePastMoments(nowString),
    ...whereUserMoments(userId),
    ...whereContains(contains),
  };

  return await prisma.moment.count({ where });
}

export async function countUserPastMomentsShownBeforeMoment(
  userId: string,
  nowString: string,
  moment: SelectMomentIdNameAndDates,
) {
  // const where = Object.assign(
  //   wherePastMoments(nowString),
  //   whereUserMoments(userId),
  //   // based on findPastUserMomentsWithContains's orderBy
  //   {
  //     OR: [
  //       whereShownBeforePastMoments(moment),
  //       whereShownAlongButBeforeMoments(moment),
  //     ],
  //   },
  // );
  const where = {
    ...wherePastMoments(nowString),
    ...whereUserMoments(userId),
    // based on findPastUserMomentsWithContains's orderBy
    ...{
      OR: [
        whereShownBeforePastMoments(moment),
        whereShownAlongButBeforeMoments(moment),
      ],
    },
  };

  return await prisma.moment.count({
    where,
  });
}

export async function countUserCurrentMomentsWithContains(
  userId: string,
  contains: string,
  nowString: string,
) {
  // const where = Object.assign(
  //   whereCurrentMoments(nowString),
  //   whereUserMoments(userId),
  //   whereContains(contains),
  // );
  const where = {
    ...whereCurrentMoments(nowString),
    ...whereUserMoments(userId),
    ...whereContains(contains),
  };

  return await prisma.moment.count({ where });
}

export async function countUserCurrentMomentsShownBeforeMoment(
  userId: string,
  nowString: string,
  moment: SelectMomentIdNameAndDates,
) {
  // const where = Object.assign(
  //   whereCurrentMoments(nowString),
  //   whereUserMoments(userId),
  //   // based on findCurrentUserMomentsWithContains's orderBy
  //   {
  //     OR: [
  //       whereShownBeforeCurrentMoments(moment),
  //       whereShownAlongButBeforeMoments(moment),
  //     ],
  //   },
  // );
  const where = {
    ...whereCurrentMoments(nowString),
    ...whereUserMoments(userId),
    // based on findCurrentUserMomentsWithContains's orderBy
    ...{
      OR: [
        whereShownBeforeCurrentMoments(moment),
        whereShownAlongButBeforeMoments(moment),
      ],
    },
  };

  return await prisma.moment.count({
    where,
  });
}

export async function countUserFutureMomentsWithContains(
  userId: string,
  contains: string,
  nowString: string,
) {
  // const where = Object.assign(
  //   whereFutureMoments(nowString),
  //   whereUserMoments(userId),
  //   whereContains(contains),
  // );
  const where = {
    ...whereFutureMoments(nowString),
    ...whereUserMoments(userId),
    ...whereContains(contains),
  };

  return await prisma.moment.count({ where });
}

export async function countUserFutureMomentsShownBeforeMoment(
  userId: string,
  nowString: string,
  moment: SelectMomentIdNameAndDates,
) {
  // const where = Object.assign(
  //   whereFutureMoments(nowString),
  //   whereUserMoments(userId),
  //   // based on findFutureUserMomentsWithContains's orderBy
  //   {
  //     OR: [
  //       whereShownBeforeFutureMoments(moment),
  //       whereShownAlongButBeforeMoments(moment),
  //     ],
  //   },
  // );
  const where = {
    ...whereFutureMoments(nowString),
    ...whereUserMoments(userId),
    // based on findFutureUserMomentsWithContains's orderBy
    ...{
      OR: [
        whereShownBeforeFutureMoments(moment),
        whereShownAlongButBeforeMoments(moment),
      ],
    },
  };

  return await prisma.moment.count({
    where,
  });
}

// FindManys

// preemptive renaming to address collision
export async function falseFindUserAllMomentsWithContains(
  userId: string,
  contains: string,
  userMomentsPage: number,
) {
  // const where = Object.assign(
  //   whereUserMoments(userId),
  //   whereContains(contains),
  // );
  const where = {
    ...whereUserMoments(userId),
    ...whereContains(contains),
  };
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

export async function findUserAllMomentsWithContains(
  userId: string,
  contains: string,
  _nowString: string,
  userMomentsPage: number,
) {
  // const where = Object.assign(
  //   whereUserMoments(userId),
  //   whereContains(contains),
  // );
  const where = {
    ...whereUserMoments(userId),
    ...whereContains(contains),
  };
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

export async function findUserPastMomentsWithContains(
  userId: string,
  contains: string,
  nowString: string,
  pastUserMomentsPage: number,
) {
  // const where = Object.assign(
  //   wherePastMoments(nowString),
  //   whereUserMoments(userId),
  //   whereContains(contains),
  // );
  const where = {
    ...wherePastMoments(nowString),
    ...whereUserMoments(userId),
    ...whereContains(contains),
  };
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

export async function findUserCurrentMomentsWithContains(
  userId: string,
  contains: string,
  nowString: string,
  currentUserMomentsPage: number,
) {
  // const where = Object.assign(
  //   whereCurrentMoments(nowString),
  //   whereUserMoments(userId),
  //   whereContains(contains),
  // );
  const where = {
    ...whereCurrentMoments(nowString),
    ...whereUserMoments(userId),
    ...whereContains(contains),
  };
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

export async function findUserFutureMomentsWithContains(
  userId: string,
  contains: string,
  nowString: string,
  futureUserMomentsPage: number,
) {
  // const where = Object.assign(
  //   whereFutureMoments(nowString),
  //   whereUserMoments(userId),
  //   whereContains(contains),
  // );
  const where = {
    ...whereFutureMoments(nowString),
    ...whereUserMoments(userId),
    ...whereContains(contains),
  };
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
