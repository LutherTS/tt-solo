// no directive
// Proposes no directive to enforce a Server Module.

/* IMPORTS */

// Internal imports

import { hashids } from "@/app/constants/server/globals";

/* LOGIC */

// Encode UUID
export const encodeUUIDWithHashids = (uuid: string) => {
  const hex = uuid.replace(/-/g, ""); // Remove hyphens
  return hashids.encodeHex(hex); // Encode the hex string
};

// Decode back to UUID
export const decodeHashidToUUID = (hashid: string) => {
  const hex = hashids.decodeHex(hashid); // Decode to hex
  // Re-insert hyphens into the original UUID format
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};
