// "use server";
// Proposes "use server" to enforce a Server Module.

/* IMPORTS */

// Internal imports

import { selectUserIdAndUsername } from "@/app/reads/server/subreads/users";

// Types imports

import type { Prisma } from "@prisma/client";

/* LOGIC */

export type SelectUserIdAndUsername = Prisma.UserGetPayload<{
  select: typeof selectUserIdAndUsername;
}>;
