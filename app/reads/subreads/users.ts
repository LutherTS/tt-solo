import { Prisma } from "@prisma/client";

// Selects

export const selectUserIdAndUsername = {
  id: true,
  username: true,
} satisfies Prisma.UserSelect;

// WhereUniques

export function whereByUsername(username: string): Prisma.UserWhereUniqueInput {
  return {
    username,
  };
}
