import type { Value, ViewProps } from "@tweakpane/core";
import { VariableType, VariableValue } from "../graph/types";

export type VariableEntry = {
  id: string;
  name: string;
  type: VariableType;
  value: VariableValue;
};

export type VariableEntryConfig = {
  value: Value<VariableEntry>;
  viewProps: ViewProps;
};
