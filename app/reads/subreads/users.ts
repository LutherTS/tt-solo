import { Prisma } from "@prisma/client";

export const selectUserId = {
  id: true,
} satisfies Prisma.UserSelect;

export function whereByUsername(username: string): Prisma.UserWhereUniqueInput {
  return {
    username,
  };
}
