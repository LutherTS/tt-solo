"use client";
// Proposes "use client" to enforce a Client Module.

/* IMPORTS */

// types imports

import type { Dispatch, SetStateAction } from "react";

/* LOGIC */

export type SetState<T> = Dispatch<SetStateAction<T>>;

export type TypedURLSearchParams<T extends Record<string, string>> = {
  get<K extends keyof T>(key: K): string | null;
  set<K extends keyof T>(key: K, value: T[K]): void;
  delete<K extends keyof T>(key: K): void;
} & Omit<URLSearchParams, "get" | "set" | "delete">;
