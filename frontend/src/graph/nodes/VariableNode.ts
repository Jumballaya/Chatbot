import { GraphNode } from "../GraphNode";
import { NodeContext } from "../NodeContext";
import {
  ExecutionUpdate,
  NodeStatus,
  RetryConfig,
  OnCompleteCB,
  InputPort,
  OutputPort,
  VariableType,
  VariableValue,
} from "../types";

export class VariableNode extends GraphNode<"variable"> {
  private _varName: string = "";
  private _varType: VariableType = "string";

  constructor(
    name: string,
    retryConfig: RetryConfig = { policy: "never" },
    onComplete?: OnCompleteCB
  ) {
    super(name, "variable", retryConfig, onComplete);
  }

  public set variable(v: { name: string; type: VariableType }) {
    this._varName = v.name;
    this._varType = v.type;
  }

  public inputs(): Record<string, InputPort> {
    return {};
  }

  public outputs(): Record<string, OutputPort> {
    return {
      value: { type: this._varType },
    };
  }

  public async *execute(
    context: NodeContext
  ): AsyncIterable<ExecutionUpdate<{ value: VariableValue }>> {
    const val = context.graph.global[this._varName];
    context.setOutput("value", val);
    yield {
      status: NodeStatus.Completed,
      output: { value: val },
      final: true,
      nodeId: this.id,
    };
  }

  public onComplete(
    result: { value: VariableValue },
    context: NodeContext
  ): void | Promise<void> {
    this.onCompleteCB?.(result, context);
  }
}
