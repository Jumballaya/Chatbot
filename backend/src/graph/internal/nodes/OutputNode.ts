import { GraphNode } from "../GraphNode";
import { NodeContext } from "../NodeContext";
import {
  ExecutionUpdate,
  NodeStatus,
  RetryConfig,
  OutputPort,
  InputPort,
} from "../types";

export class OutputNode extends GraphNode<"output"> {
  constructor(name: string, retryConfig: RetryConfig = { policy: "never" }) {
    super(name, "output", retryConfig);
  }

  public inputs(): Record<string, InputPort> {
    return {
      input: { type: "string", default: "" },
    };
  }

  public outputs(): Record<string, OutputPort> {
    return {
      output: { type: "string" },
    };
  }

  public async *execute(
    context: NodeContext
  ): AsyncIterable<ExecutionUpdate<{ text: string }>> {
    const text = context.getInput<string>("input");
    context.setOutput("output", text);
    yield {
      status: NodeStatus.Completed,
      output: { text: text ?? "" },
      final: true,
      nodeId: this.id,
    };
  }
}
