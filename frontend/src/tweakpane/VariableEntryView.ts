import { View, ViewProps, Value } from "@tweakpane/core";
import { VariableEntry } from "./types";

export class VariableEntryView implements View {
  public readonly element: HTMLElement;
  public readonly nameInput: HTMLInputElement;
  public readonly typeSelect: HTMLSelectElement;
  public readonly valueInput: HTMLInputElement;
  public readonly removeButton: HTMLButtonElement;

  public onChange?: (next: Partial<VariableEntry>) => void;
  public onRemove?: () => void;

  constructor(
    doc: Document,
    config: {
      value: Value<VariableEntry>;
      viewProps: ViewProps;
    }
  ) {
    const { value } = config;

    this.element = doc.createElement("div");
    this.element.classList.add("tp-variable-entry");

    this.nameInput = doc.createElement("input");
    this.nameInput.value = value.rawValue.name;

    this.typeSelect = doc.createElement("select");
    ["string", "number", "boolean"].forEach((t) => {
      const opt = doc.createElement("option");
      opt.value = t;
      opt.textContent = t;
      this.typeSelect.appendChild(opt);
    });
    this.typeSelect.value = value.rawValue.type;

    this.valueInput = doc.createElement("input");
    this.valueInput.value = String(value.rawValue.value ?? "");

    this.removeButton = doc.createElement("button");
    this.removeButton.textContent = "×";
    this.removeButton.title = "Remove variable";

    // Event bindings
    this.nameInput.addEventListener("input", () => {
      this.onChange?.({ name: this.nameInput.value });
    });

    this.typeSelect.addEventListener("change", () => {
      this.onChange?.({ type: this.typeSelect.value as VariableEntry["type"] });
    });

    this.valueInput.addEventListener("input", () => {
      const raw = this.valueInput.value;
      const type = this.typeSelect.value;
      const parsed =
        type === "number"
          ? parseFloat(raw)
          : type === "boolean"
          ? raw === "true"
          : raw;
      this.onChange?.({ value: parsed });
    });

    this.removeButton.addEventListener("click", () => {
      this.onRemove?.();
    });

    value.emitter.on("change", () => {
      this.nameInput.value = value.rawValue.name;
      this.typeSelect.value = value.rawValue.type;
      this.valueInput.value = String(value.rawValue.value ?? "");
    });

    this.element.append(
      this.nameInput,
      this.typeSelect,
      this.valueInput,
      this.removeButton
    );
  }
}
