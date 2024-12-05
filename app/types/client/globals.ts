"use client";
// Enforces a Client Module.

import { Dispatch, SetStateAction } from "react";

export type SetState<T> = Dispatch<SetStateAction<T>>;

export type TypedURLSearchParams<T extends Record<string, string>> = {
  get<K extends keyof T>(key: K): string | null;
  set<K extends keyof T>(key: K, value: T[K]): void;
  delete<K extends keyof T>(key: K): void;
} & Omit<URLSearchParams, "get" | "set" | "delete">;
