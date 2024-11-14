import { Prisma } from "@prisma/client";
import { selectDestinationKeyAndName } from "../reads/subreads/destinations";

export type DestinationToCRUD = {
  id: string;
  ideal: string;
  aspiration: string | null;
  allMomentsCount: number;
  pastMomentsCount: number;
  currentMomentsCount: number;
  futureMomentsCount: number;
};

export type SelectDestinationForMoment = Prisma.DestinationGetPayload<{
  select: typeof selectDestinationKeyAndName;
}>;
