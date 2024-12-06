// "use server";
// Proposes "use server" to enforce a Server Module.

/* IMPORTS */

// Internal imports

import { selectDestinationIdAndName } from "@/app/readings/server/subreads/destinations";

// Types imports

import type { Prisma } from "@prisma/client";

/* LOGIC */

export type SelectDestinationForMoment = Prisma.DestinationGetPayload<{
  select: typeof selectDestinationIdAndName;
}>;
