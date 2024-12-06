// "use server";
// Proposes "use server" to enforce a Server Module.

/* IMPORTS */

// Types imports

import type { Prisma } from "@prisma/client";

/* LOGIC */

// Selects

export const selectDestinationId = {
  id: true,
} satisfies Prisma.DestinationSelect;

export const selectDestinationIdAndName = {
  id: true,
  name: true,
} satisfies Prisma.DestinationSelect;

// Wheres

export function whereByUserId(userId: string): Prisma.DestinationWhereInput {
  return {
    userId,
  };
}

// WhereUniques

export function whereByNameAndUserId(
  name: string,
  userId: string,
): Prisma.DestinationWhereUniqueInput {
  return {
    name_userId: {
      name,
      userId,
    },
  };
}

// OrderBys

export const destinationsOrderByDefault = {
  updatedAt: "desc",
} satisfies Prisma.DestinationOrderByWithRelationInput;
