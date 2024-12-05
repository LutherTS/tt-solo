import { Dispatch, SetStateAction } from "react";

import * as AllGlobalIcons from "@/app/icons/agnostic";

export type Option = {
  key: string;
  label: string;
  value: string;
};

export type SetState<T> = Dispatch<SetStateAction<T>>;

export type NavLink = {
  id: string;
  label: string;
  href: string;
  icon: AllGlobalIcons.AllGlobalIconName;
};

export type TypedURLSearchParams<T extends Record<string, string>> = {
  get<K extends keyof T>(key: K): string | null;
  set<K extends keyof T>(key: K, value: T[K]): void;
  delete<K extends keyof T>(key: K): void;
} & Omit<URLSearchParams, "get" | "set" | "delete">;
