import { GraphNode } from "../GraphNode";
import { NodeContext } from "../NodeContext";
import {
  ExecutionUpdate,
  NodeStatus,
  RetryConfig,
  InputPort,
  OutputPort,
  IOType,
} from "../types";

export class VariableNode extends GraphNode<"variable"> {
  private _varName: string = "";
  private _varType: IOType = "string";

  constructor(name: string, retryConfig: RetryConfig = { policy: "never" }) {
    super(name, "variable", retryConfig);
  }

  public set variable(v: { name: string; type: IOType }) {
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
  ): AsyncIterable<ExecutionUpdate<{ value: IOType }>> {
    const val = context.graph.global[this._varName];
    context.setOutput("value", val);
    yield {
      status: NodeStatus.Completed,
      output: { value: val },
      final: true,
      nodeId: this.id,
    };
  }
}
