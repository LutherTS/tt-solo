// "use server";
// Proposes "use server" to enforce a Server Module.

/* IMPORTS */

// Internal imports

import { selectUserIdAndUsername } from "@/app/readings/server/subreads/users";

// Types imports

import { Prisma } from "@prisma/client";

/* LOGIC */

export type SelectUserIdAndUsername = Prisma.UserGetPayload<{
  select: typeof selectUserIdAndUsername;
}>;
