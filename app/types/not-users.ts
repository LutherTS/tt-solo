import { Prisma } from "@prisma/client";

import { selectUserIdAndUsername } from "../readings/server/subreads/users";

export type SelectUserIdAndUsername = Prisma.UserGetPayload<{
  select: typeof selectUserIdAndUsername;
}>;
