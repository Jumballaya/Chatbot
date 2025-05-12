import { ExecutionGraph } from "../ExecutionGraph";
import { GraphNode } from "../GraphNode";
import { NodeContext } from "../NodeContext";
import {
  ExecutionUpdate,
  NodeStatus,
  RetryConfig,
  Data,
  OnCompleteCB,
  InputPort,
  OutputPort,
} from "../types";

export class OutputNode extends GraphNode<"output"> {
  constructor(
    name: string,
    retryConfig: RetryConfig = { policy: "never" },
    onComplete?: OnCompleteCB
  ) {
    super(name, "output", retryConfig, onComplete);
  }

  public inputs(): Record<string, InputPort> {
    return {
      text: { type: "string", required: true },
    };
  }

  public outputs(): Record<string, OutputPort> {
    return {
      text: { type: "string" },
    };
  }

  public async *execute(
    context: NodeContext
  ): AsyncIterable<ExecutionUpdate<{ text: string }>> {
    const text = context.getInput<string>("text");
    context.setOutput("text", text);
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
