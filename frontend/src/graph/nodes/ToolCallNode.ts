import { Ollama, ToolCall } from "ollama";
import { GraphNode } from "../GraphNode";
import {
  ToolCallOutputs,
  Tool,
  ExecutionUpdate,
  NodeStatus,
  RetryConfig,
  OnCompleteCB,
  OutputPort,
  InputPort,
} from "../types";
import { NodeContext } from "../NodeContext";
import { ExecutionGraph } from "../ExecutionGraph";

const ollama = new Ollama({ host: "http://localhost:11434" });

export class ToolCallNode extends GraphNode<"tool-call"> {
  private _model: string;
  private _tools: Tool[];

  constructor(
    id: string,
    tools: Tool[],
    model: string,
    retryConfig: RetryConfig = { policy: "never" },
    onComplete?: OnCompleteCB
  ) {
    super(id, "tool-call", retryConfig, onComplete);
    this._model = model;
    this._tools = tools;
  }

  public inputs(): Record<string, InputPort> {
    return {
      tools: { type: "any", required: true },
    };
  }

  public outputs(): Record<string, OutputPort> {
    return {
      selectedTool: { type: "string" },
      toolArgs: { type: "any" },
    };
  }

  async *execute(
    ctx: NodeContext
  ): AsyncIterable<ExecutionUpdate<ToolCallOutputs>> {
    const tools = ctx.getInput<Tool[]>("tools");
    const messages = ctx.graph.chatHistory;

    try {
      const toolRes = await ollama.chat({
        stream: true,
        model: this._model,
        messages,
        tools,
      });
      for await (const r of toolRes) {
        if (r.message.tool_calls?.length) {
          for (const tc of r.message.tool_calls as ToolCall[]) {
            const name = tc.function.name;
            const args = tc.function.arguments;
            ctx.setOutput("selectedTool", name);
            ctx.setOutput("toolArgs", args);
            ctx.graph.chatHistory.push({
              role: "tool",
              content: `${name}(${JSON.stringify(args)})`,
            });
            yield {
              nodeId: this.id,
              status: NodeStatus.Completed,
              final: true,
              output: ctx.getOutputs(),
            };
          }
        }
        return;
      }

      // fallback (no tool selected)
      yield {
        nodeId: this.id,
        status: NodeStatus.Completed,
        final: true,
        output: ctx.getOutputs(),
      };
    } catch (e) {
      yield {
        nodeId: this.id,
        status: NodeStatus.Failed,
        error: e instanceof Error ? e.message : `${e}`,
      };
    }
  }

  public onComplete(
    result: ToolCallOutputs,
    context: NodeContext
  ): void | Promise<void> {
    this.onCompleteCB?.(result, context);
  }
}
