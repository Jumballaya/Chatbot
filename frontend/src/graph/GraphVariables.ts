import { nanoid } from "nanoid";
import { VariableDef, VariableType, VariableValue } from "./types";

export class GraphVariables {
  private _definitions: Record<string, VariableDef> = {};
  private _variables: Record<string, VariableValue> = {};
  public readonly variables: Record<string, VariableValue>;

  constructor() {
    this.variables = new Proxy(this._variables, {
      get: (target, key: string) => target[key],
      set: (target, key: string, value) => {
        const def = this._definitions[key];
        if (!def) throw new Error(`Variable '${key}' not defined`);
        if (typeof value !== def.type) {
          throw new TypeError(`Expected '${key}' to be type ${def.type}`);
        }
        target[key] = value;
        return true;
      },
    });
  }

  public addVariable(
    name: string,
    type: VariableType,
    initial?: VariableValue
  ) {
    if (name in this._definitions) {
      throw new Error(`Variable '${name}' already exists`);
    }
    const defaultValue: VariableValue =
      initial ??
      (type === "number"
        ? 0
        : type === "string"
        ? ""
        : type === "boolean"
        ? false
        : "");

    const id = nanoid(8);
    this._definitions[id] = { id, name, type, value: initial ?? defaultValue };
    this._variables[name] = defaultValue;
    return id;
  }

  public updateVariable(
    id: string,
    variable: Partial<Omit<VariableDef, "id">>
  ) {
    const newName = variable.name;
    if (newName) {
      const exists = Object.values(this._definitions).some(
        (d) => d.id !== id && d.name === newName
      );
      if (exists) return;
    }
    if (!(id in this._definitions)) return;

    this._definitions[id] = {
      ...this._definitions[id],
      ...variable,
    };
  }

  public getVariable<T extends VariableValue>(name: string): T | undefined {
    const found = this._definitions[name];
    if (found) return found.value as T;
  }

  public getVariableDef(name: string): VariableDef | undefined {
    const found = this._definitions[name];
    if (found) return found;
  }

  public hasVariableId(id: string) {
    return id in this._definitions;
  }

  public removeVariable(name: string) {
    delete this._definitions[name];
    delete this._variables[name];
  }

  public setVariable(name: keyof typeof this._variables, value: VariableValue) {
    this.variables[name] = value;
  }

  public getVariables() {
    return this._definitions;
  }
}
