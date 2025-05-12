import {
  ExecutionUpdate,
  NodeStatus,
  RetryConfig,
  Data,
  OnCompleteCB,
  InputPort,
  OutputPort,
} from "../types";
import { GraphNode } from "../GraphNode";
import { NodeContext } from "../NodeContext";
import { ExecutionGraph } from "../ExecutionGraph";

export class PromptNode extends GraphNode<"prompt"> {
  constructor(
    name: string,
    retryConfig: RetryConfig = { policy: "never" },
    onComplete?: OnCompleteCB
  ) {
    super(name, "prompt", retryConfig, onComplete);
  }

  public inputs(): Record<string, InputPort> {
    return {
      input: {
        type: "string",
        required: true,
      },
    };
  }

  public outputs(): Record<string, OutputPort> {
    return {
      prompt: {
        type: "string",
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
