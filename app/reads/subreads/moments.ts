import { Prisma } from "@prisma/client";

import { stepsOrderByDefault } from "./steps";
import { SelectMomentIdNameAndDates } from "@/app/types/moments";

// Selects

export const selectMomentId = {
  id: true,
} satisfies Prisma.MomentSelect;

export const selectMomentIdNameAndDates = {
  id: true,
  name: true,
  startDateAndTime: true,
  endDateAndTime: true,
} satisfies Prisma.MomentSelect;

// Includes

export const includeMomentDestinationAndSteps = {
  destination: true,
  steps: {
    orderBy: stepsOrderByDefault,
  },
} satisfies Prisma.MomentInclude;

// Wheres

export function whereUserMoments(userId: string): Prisma.MomentWhereInput {
  return {
    destination: {
      userId,
    },
    userId,
  };
}

export function whereContains(contains: string): Prisma.MomentWhereInput {
  return {
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

export function whereShownBeforePastMoments(
  moment: SelectMomentIdNameAndDates,
): Prisma.MomentWhereInput {
  return {
    startDateAndTime: {
      gt: moment.startDateAndTime,
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

export function whereShownBeforeCurrentMoments(
  moment: SelectMomentIdNameAndDates,
): Prisma.MomentWhereInput {
  return {
    startDateAndTime: {
      lt: moment.startDateAndTime,
    },
  };
}

export function whereFutureMoments(nowString: string): Prisma.MomentWhereInput {
  return {
    startDateAndTime: {
      gt: nowString,
    },
  };
}

export function whereShownBeforeFutureMoments(
  moment: SelectMomentIdNameAndDates,
): Prisma.MomentWhereInput {
  return {
    startDateAndTime: {
      lt: moment.startDateAndTime,
    },
  };
}

export function whereShownAlongButBeforeMoments(
  moment: SelectMomentIdNameAndDates,
): Prisma.MomentWhereInput {
  return {
    AND: [
      {
        startDateAndTime: {
          equals: moment.startDateAndTime,
        },
      },
      {
        name: { lt: moment.name },
      },
    ],
  };
}

// WhereUniques

export function whereMomentId(id: string): Prisma.MomentWhereUniqueInput {
  return {
    id,
  };
}

export function whereByNameAndUserId(
  name: string,
  userId: string,
): Prisma.MomentWhereUniqueInput {
  return {
    name_userId: {
      name,
      userId,
    },
  };
}

export function whereMomentIdAndUserId(
  id: string,
  userId: string,
): Prisma.MomentWhereUniqueInput {
  return {
    id,
    userId,
  };
}

// OrderBys

export const momentsOrderByStartDesc = {
  startDateAndTime: "desc",
} satisfies Prisma.MomentOrderByWithRelationInput;

export const momentsOrderByStartAsc = {
  startDateAndTime: "asc",
} satisfies Prisma.MomentOrderByWithRelationInput;

// enough because no two moments from the same user are allowed to have the same name at the database or Prisma levels
export const momentsOrderByNameAsc = {
  name: "asc",
} satisfies Prisma.MomentOrderByWithRelationInput;
