import {
  ExecutionUpdate,
  NodeStatus,
  RetryConfig,
  OnCompleteCB,
  InputPort,
  OutputPort,
} from "../types";
import { GraphNode } from "../GraphNode";
import { NodeContext } from "../NodeContext";

export class StringNode extends GraphNode<"string"> {
  private _string = "";

  constructor(
    name: string,
    retryConfig: RetryConfig = { policy: "never" },
    onComplete?: OnCompleteCB
  ) {
    super(name, "string", retryConfig, onComplete);
  }

  public set string(s: string) {
    this._string = s;
  }

  public get string() {
    return this._string;
  }

  public inputs(): Record<string, InputPort> {
    return {};
  }

  public outputs(): Record<string, OutputPort> {
    return {
      string: {
        type: "string",
      },
    };
  }

  public async *execute(
    context: NodeContext
  ): AsyncIterable<ExecutionUpdate<{ string: string }>> {
    context.setOutput("string", this._string);
    yield {
      status: NodeStatus.Completed,
      output: { string: this._string },
      final: true,
      nodeId: this.id,
    };
  }

  public onComplete(
    result: { string: string },
    context: NodeContext
  ): void | Promise<void> {
    this.onCompleteCB?.(result, context);
  }
}
