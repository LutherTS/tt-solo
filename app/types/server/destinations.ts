// "use server";
// Proposes "use server" to enforce a Server Module.

import { Prisma } from "@prisma/client";

import { selectDestinationIdAndName } from "@/app/readings/server/subreads/destinations";

export type SelectDestinationForMoment = Prisma.DestinationGetPayload<{
  select: typeof selectDestinationIdAndName;
}>;
