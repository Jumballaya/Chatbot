import {
  ExecutionUpdate,
  NodeStatus,
  RetryConfig,
  InputPort,
  OutputPort,
} from "../types";
import { GraphNode } from "../GraphNode";
import { NodeContext } from "../NodeContext";

export class PromptNode extends GraphNode<"prompt"> {
  constructor(name: string, retryConfig: RetryConfig = { policy: "never" }) {
    super(name, "prompt", retryConfig);
  }

  public inputs(): Record<string, InputPort> {
    return {
      input: {
        type: "string",
        default: "",
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
    const prompt = context.getInput<string>("input") ?? "";
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
}
