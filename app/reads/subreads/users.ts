import { Prisma } from "@prisma/client";

// Selects

export const selectUserId = {
  id: true,
} satisfies Prisma.UserSelect;

// WhereUniques

export function whereByUsername(username: string): Prisma.UserWhereUniqueInput {
  return {
    username,
  };
}
