import {
  ExecutionUpdate,
  NodeStatus,
  RetryConfig,
  OnCompleteCB,
  Port,
} from "../types";
import { GraphNode } from "../GraphNode";
import { NodeContext } from "../NodeContext";

export class PromptNode extends GraphNode<"prompt"> {
  constructor(
    name: string,
    retryConfig: RetryConfig = { policy: "never" },
    onComplete?: OnCompleteCB
  ) {
    super(name, "prompt", retryConfig, onComplete);
  }

  public inputs(): Record<string, Port<"string">> {
    return {
      input: {
        type: "string",
        value: "",
        connected: false,
      },
    };
  }

  public outputs(): Record<string, Port<"string">> {
    return {
      prompt: {
        type: "string",
        value: "",
        connected: false,
      },
    };
  }

  public async *execute(
    context: NodeContext
  ): AsyncIterable<ExecutionUpdate<{ prompt: string }>> {
    const prompt: string = context.getInput("input");
    context.setOutput("prompt", prompt);
    context.graph.chatHistory.push({
      role: "user",
      content: prompt,
    });
    yield {
      status: NodeStatus.Completed,
      output: { prompt: prompt },
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
