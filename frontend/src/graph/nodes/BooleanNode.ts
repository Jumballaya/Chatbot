import {
  ExecutionUpdate,
  NodeStatus,
  RetryConfig,
  OnCompleteCB,
  OutputPort,
  InputPort,
} from "../types";
import { GraphNode } from "../GraphNode";
import { NodeContext } from "../NodeContext";

export class BooleanNode extends GraphNode<"boolean"> {
  private _boolean = false;

  constructor(
    name: string,
    retryConfig: RetryConfig = { policy: "never" },
    onComplete?: OnCompleteCB
  ) {
    super(name, "boolean", retryConfig, onComplete);
  }

  public set boolean(s: boolean) {
    this._boolean = s;
  }

  public get boolean() {
    return this._boolean;
  }

  public inputs(): Record<string, InputPort> {
    return {};
  }

  public outputs(): Record<string, OutputPort> {
    return {
      boolean: {
        type: "boolean",
      },
    };
  }

  public async *execute(
    context: NodeContext
  ): AsyncIterable<ExecutionUpdate<{ boolean: boolean }>> {
    context.setOutput("boolean", this._boolean);
    yield {
      status: NodeStatus.Completed,
      output: { boolean: this._boolean },
      final: true,
      nodeId: this.id,
    };
  }

  public onComplete(
    result: { boolean: boolean },
    context: NodeContext
  ): void | Promise<void> {
    this.onCompleteCB?.(result, context);
  }
}
