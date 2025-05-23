// no directive
// Proposes no directive to enforce a Server Module.

/* IMPORTS */

// Internal imports

import { selectDestinationIdAndName } from "@/app/reads/server/subreads/destinations";

// Types imports

import type { Prisma } from "@prisma/client";

/* LOGIC */

export type SelectDestinationForMoment = Prisma.DestinationGetPayload<{
  select: typeof selectDestinationIdAndName;
}>;
