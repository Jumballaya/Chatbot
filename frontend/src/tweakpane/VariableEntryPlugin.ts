import { VariableEntryController } from "./VariableEntryController";
import {
  BindingTarget,
  createPlugin,
  TpPlugin,
  Value,
  ViewProps,
} from "@tweakpane/core";
import { VariableEntry } from "./types";

export const VariableEntryPlugin = createPlugin({
  id: "variable-entry",
  type: "input" as const,

  accept(value: unknown, params: Record<string, unknown>) {
    if (
      typeof value !== "object" ||
      value === null ||
      params.view !== "variable-entry"
    ) {
      return null;
    }

    const v = value as object;
    if (!("name" in v && "type" in v && "value" in v)) return null;

    return {
      initialValue: v,
      params,
    };
  },

  binding: {
    reader: () => (v: unknown) => v,
    writer: () => (target: BindingTarget, v: unknown) => {
      target.write(v);
    },
  },

  controller(args: {
    document: Document;
    value: Value<VariableEntry>;
    viewProps: ViewProps;
  }) {
    return new VariableEntryController(args.document, {
      value: args.value,
      viewProps: args.viewProps,
    });
  },
} as TpPlugin) satisfies TpPlugin;
