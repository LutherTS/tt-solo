import { Prisma } from "@prisma/client";

// Wheres

export function whereByUserId(userId: string): Prisma.DestinationWhereInput {
  return {
    userId,
  };
}

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
