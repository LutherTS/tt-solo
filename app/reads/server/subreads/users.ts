// no directive
// Proposes no directive to enforce a Server Module.

/* IMPORTS */

// Types imports

import type { Prisma } from "@prisma/client";

/* LOGIC */

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
