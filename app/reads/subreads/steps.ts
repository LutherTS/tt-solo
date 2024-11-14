import { Prisma } from "@prisma/client";

// There could be a conflict with whereByMomentId, but at this time I'll keep it as is, and if there are conflicts in imports, then I'll rename whereByMomentId as stepsWereByMomentId in the import statement.

// Selects

export const selectStepDefault = {
  id: true,
  orderId: true,
  name: true,
  description: true,
  startDateAndTime: true,
  duration: true,
  endDateAndTime: true,
} satisfies Prisma.StepSelect;

// Wheres

export function whereByMomentId(momentId: string): Prisma.StepWhereInput {
  return {
    momentId,
  };
}

// OrderBys

export const orderByStepsDefault = {
  orderId: "asc",
} satisfies Prisma.StepOrderByWithRelationInput;
