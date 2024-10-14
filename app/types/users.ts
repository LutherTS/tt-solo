import { Prisma } from "@prisma/client";

import { selectUserIdAndUsername } from "../reads/subreads/users";

export type SelectUserIdAndUsername = Prisma.UserGetPayload<{
  select: typeof selectUserIdAndUsername;
}>;
