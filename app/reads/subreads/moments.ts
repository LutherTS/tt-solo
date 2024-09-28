import { Prisma } from "@prisma/client";

import { stepsOrderByDefault } from "./steps";

// Includes

export const includeMomentDestinationAndSteps = {
  destination: true,
  steps: {
    orderBy: stepsOrderByDefault,
  },
} satisfies Prisma.MomentInclude;

// Wheres

export function whereUserMomentsWithContains(
  userId: string,
  contains: string,
): Prisma.MomentWhereInput {
  return {
    destination: {
      userId,
    },
    name: {
      contains: contains !== "" ? contains : undefined,
    },
  };
}

export function wherePastMoments(nowString: string): Prisma.MomentWhereInput {
  return {
    endDateAndTime: {
      lt: nowString,
    },
  };
}

export function whereCurrentMoments(
  nowString: string,
): Prisma.MomentWhereInput {
  return {
    AND: [
      { startDateAndTime: { lte: nowString } },
      { endDateAndTime: { gte: nowString } },
    ],
  };
}

export function whereFutureMoments(nowString: string): Prisma.MomentWhereInput {
  return {
    startDateAndTime: {
      gt: nowString,
    },
  };
}

// WhereUniques

export function whereMomentId(id: string): Prisma.MomentWhereUniqueInput {
  return {
    id,
  };
}

// OrderBys

export const momentsOrderByStartDesc = {
  startDateAndTime: "desc",
} satisfies Prisma.MomentOrderByWithRelationInput;

export const momentsOrderByStartAsc = {
  startDateAndTime: "asc",
} satisfies Prisma.MomentOrderByWithRelationInput;
