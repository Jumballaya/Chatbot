import { GraphNode } from "../GraphNode";
import { NodeContext } from "../NodeContext";
import {
  ExecutionUpdate,
  NodeStatus,
  RetryConfig,
  OnCompleteCB,
  Port,
} from "../types";

export class OutputNode extends GraphNode<"output"> {
  constructor(
    name: string,
    retryConfig: RetryConfig = { policy: "never" },
    onComplete?: OnCompleteCB
  ) {
    super(name, "output", retryConfig, onComplete);
  }

  public inputs(): Record<string, Port<"string">> {
    return {
      input: { type: "string", connected: false, value: "" },
    };
  }

  public outputs(): Record<string, Port<"string">> {
    return {
      output: { type: "string", connected: false, value: "" },
    };
  }

  public async *execute(
    context: NodeContext
  ): AsyncIterable<ExecutionUpdate<{ text: string }>> {
    const text = context.getInput<string>("input");
    context.setOutput("output", text);
    yield {
      status: NodeStatus.Completed,
      output: { text },
      final: true,
      nodeId: this.id,
    };
  }

  public onComplete(
    result: { text: string },
    context: NodeContext
  ): void | Promise<void> {
    this.onCompleteCB?.(result, context);
  }
}
