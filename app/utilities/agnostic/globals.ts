"use agnostic";
// Proposes "use agnostic" to enforce an Agnostic Module.

/* LOGIC */

// Delays a function for testing
export const delay = <T>(ms: number, fn: () => T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(fn()), ms));

// Because there is no nullish-safe && operator
export const isNullish = (value: any) => value === null || value === undefined;

// To establish whether a module is currently imported on the client or the server
export const isServer = () => typeof window === "undefined";
