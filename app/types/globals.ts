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
