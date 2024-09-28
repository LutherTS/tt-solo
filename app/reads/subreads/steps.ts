import { Prisma } from "@prisma/client";

// OrderBys

export const stepsOrderByDefault = {
  orderId: "asc",
} satisfies Prisma.StepOrderByWithRelationInput;
