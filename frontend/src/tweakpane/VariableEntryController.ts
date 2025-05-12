import { ValueController, ViewProps, Value } from "@tweakpane/core";
import { VariableEntryView } from "./VariableEntryView";
import { VariableEntry } from "./types";

export class VariableEntryController
  implements ValueController<VariableEntry, VariableEntryView>
{
  public readonly value: Value<VariableEntry>;
  public readonly view: VariableEntryView;
  public readonly viewProps: ViewProps;

  constructor(
    doc: Document,
    config: {
      value: Value<VariableEntry>;
      viewProps: ViewProps;
    }
  ) {
    this.value = config.value;
    this.viewProps = config.viewProps;

    this.view = new VariableEntryView(doc, {
      value: this.value,
      viewProps: this.viewProps,
    });

    this.view.onChange = (update) => {
      this.value.rawValue = {
        ...this.value.rawValue,
        ...update,
      };
    };
  }
}
