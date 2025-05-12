import { ExecutionGraph } from "../ExecutionGraph";
import { GraphNode } from "../GraphNode";
import { NodeContext } from "../NodeContext";
import {
  ComparisonOp,
  Data,
  ExecutionUpdate,
  IfInputs,
  InputPort,
  NodeStatus,
  OnCompleteCB,
  OutputPort,
  RetryConfig,
  VariableValue,
} from "../types";

export class IfNode extends GraphNode<"if"> {
  private _selector = "";
  private _target: VariableValue = "";
  private _op: ComparisonOp = "eq";
  private _ignoreCase = false;

  constructor(
    id: string,
    config: IfInputs,
    policy: RetryConfig = { policy: "never" },
    onComplete?: OnCompleteCB
  ) {
    super(id, "if", policy, onComplete);
    this._selector = config.selector;
    this._target = config.target;
    this._op = config.op;
    this._ignoreCase = config.ignoreCase ?? false;
  }

  public inputs(): Record<string, InputPort> {
    return {
      selector: { type: "string", required: true },
      target: { type: "string", required: true },
      op: { type: "string", required: true },
      ignoreCase: { type: "boolean", default: false },
    };
  }

  public outputs(): Record<string, OutputPort> {
    return {
      result: { type: "boolean" },
    };
  }

  async *execute(ctx: NodeContext): AsyncIterable<ExecutionUpdate<Data>> {
    const selector = ctx.getInput<string>("selector");
    const target = ctx.getInput<string>("target");
    const op = ctx.getInput<ComparisonOp>("op");
    const ignoreCase = ctx.getInput<boolean>("ignoreCase");

    const rawValue = this.getByPath(ctx.getOutputs(), selector);
    const result = compare(op, rawValue, target, ignoreCase);
    ctx.setOutput("result", result);

    yield {
      nodeId: this.id,
      status: NodeStatus.Completed,
      final: true,
      output: ctx.getOutputs(),
    };
  }

  public onComplete(result: Data, context: NodeContext): void | Promise<void> {
    this.onCompleteCB?.(result, context);
  }

  // returns dict['a']['b'] given 'a.b'
  private getByPath(obj: unknown, path: string) {
    return path
      .split(".")
      .reduce<unknown>(
        (acc, key) =>
          acc !== undefined && acc !== null && typeof acc === "object"
            ? (acc as Data)[key]
            : undefined,
        obj
      );
  }
}

function toString(v: unknown): string {
  if (v?.toString) {
    return v.toString();
  }
  return "";
}

function toNumber(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const out = parseFloat(v);
    if (!isNaN(out)) return out;
  }
  return 0;
}

function compare(
  op: ComparisonOp,
  value: unknown,
  target: string | number,
  ignoreCase = false
): boolean {
  switch (op) {
    case "eq":
      return value === target;
    case "lt":
      return toNumber(value) < toNumber(target);
    case "lte":
      return toNumber(value) <= toNumber(target);
    case "gt":
      return toNumber(value) > toNumber(target);
    case "gte":
      return toNumber(value) >= toNumber(target);
    case "contains": {
      const a = toString(value);
      const b = toString(target);
      return ignoreCase
        ? a.toLowerCase().includes(b.toLowerCase())
        : a.includes(b);
    }
    case "startsWith": {
      const a = toString(value);
      const b = toString(target);
      return ignoreCase
        ? a.toLowerCase().startsWith(b.toLowerCase())
        : a.startsWith(b);
    }
    case "endsWith": {
      const a = toString(value);
      const b = toString(target);
      return ignoreCase
        ? a.toLowerCase().endsWith(b.toLowerCase())
        : a.endsWith(b);
    }
    default:
      return false; // should never happen
  }
}
