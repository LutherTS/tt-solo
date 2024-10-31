import { Dispatch, SetStateAction } from "react";

import * as Icons from "@/app/icons";

export type Option = {
  key: number;
  label: string;
  value: string;
};

export type SetState<T> = Dispatch<SetStateAction<T>>;

export type NavLink = {
  id: number;
  label: string;
  href: string;
  icon: Icons.IconName;
};

export type TypedURLSearchParams<T extends Record<string, string>> = {
  get<K extends keyof T>(key: K): string | null;
  set<K extends keyof T>(key: K, value: T[K]): void;
  delete<K extends keyof T>(key: K): void;
} & Omit<URLSearchParams, "get" | "set" | "delete">;
