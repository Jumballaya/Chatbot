import type { Value, ViewProps } from "@tweakpane/core";
import { IOType, IOTypeMap } from "../graph/types";

export type VariableEntry = {
  id: string;
  name: string;
  type: IOType;
  value: IOTypeMap[IOType];
};

export type VariableEntryConfig = {
  value: Value<VariableEntry>;
  viewProps: ViewProps;
};
