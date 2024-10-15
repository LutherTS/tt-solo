import { Dispatch, SetStateAction } from "react";

export type Option = {
  key: number;
  label: string;
  value: string;
};

export type SetState<T> = Dispatch<SetStateAction<T>>;
