import { GraphNode } from "../GraphNode";
import { NodeContext } from "../NodeContext";
import {
  ToolNodeOutputs,
  ExecutionUpdate,
  NodeStatus,
  RetryConfig,
  InputPort,
  OutputPort,
} from "../types";

export class ToolNode extends GraphNode<"tool"> {
  constructor(
    id: string,
    private impl: (args: Record<string, any>) => Promise<unknown>,
    retryConfig: RetryConfig = { policy: "never" }
  ) {
    super(id, "tool", retryConfig);
  }

  public inputs(): Record<string, InputPort> {
    return {
      args: { type: "any", required: true },
    };
  }

  public outputs(): Record<string, OutputPort> {
    return {
      result: { type: "any" },
    };
  }

  async *execute(
    ctx: NodeContext
  ): AsyncIterable<ExecutionUpdate<ToolNodeOutputs>> {
    try {
      const result = await this.impl(ctx.getInput("args")!);
      ctx.setOutput("result", result);

      ctx.graph.chatHistory.push({
        role: "tool",
        content: JSON.stringify({
          name: this.id,
          result,
        }),
      });

      yield {
        nodeId: this.id,
        status: NodeStatus.Completed,
        final: true,
        output: ctx.getOutputs() as ToolNodeOutputs,
      };
    } catch (err) {
      yield {
        nodeId: this.id,
        status: NodeStatus.Failed,
        error: err instanceof Error ? err.message : "Tool execution failed",
      };
    }
  }
}
