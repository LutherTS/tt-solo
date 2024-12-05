// "use server";
// Proposes "use server" to enforce a Server Module.

import { Prisma } from "@prisma/client";

import { selectUserIdAndUsername } from "@/app/readings/server/subreads/users";

export type SelectUserIdAndUsername = Prisma.UserGetPayload<{
  select: typeof selectUserIdAndUsername;
}>;
