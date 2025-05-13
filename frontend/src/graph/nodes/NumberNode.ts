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

export class NumberNode extends GraphNode<"string"> {
  private _number = 0;

  constructor(
    name: string,
    retryConfig: RetryConfig = { policy: "never" },
    onComplete?: OnCompleteCB
  ) {
    super(name, "string", retryConfig, onComplete);
  }

  public set number(n: number) {
    this._number = n;
  }

  public get number() {
    return this._number;
  }

  public inputs(): Record<string, InputPort> {
    return {};
  }

  public outputs(): Record<string, OutputPort> {
    return {
      number: {
        type: "number",
      },
    };
  }

  public async *execute(
    context: NodeContext
  ): AsyncIterable<ExecutionUpdate<{ number: number }>> {
    context.setOutput("number", this._number);
    yield {
      status: NodeStatus.Completed,
      output: { number: this._number },
      final: true,
      nodeId: this.id,
    };
  }

  public onComplete(
    result: { number: number },
    context: NodeContext
  ): void | Promise<void> {
    this.onCompleteCB?.(result, context);
  }
}
