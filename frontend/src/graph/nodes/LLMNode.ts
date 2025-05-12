import { Ollama } from "ollama";
import {
  ExecutionUpdate,
  NodeStatus,
  RetryConfig,
  Data,
  OnCompleteCB,
  ChatEntry,
  LLMFormat,
  InputPort,
  OutputPort,
} from "../types";
import { GraphNode } from "../GraphNode";
import { NodeContext } from "../NodeContext";
import { ExecutionGraph } from "../ExecutionGraph";

const ollama = new Ollama({ host: "http://localhost:11434" });

export class LLMNode extends GraphNode<"llm"> {
  private _stream: boolean;
  private _model: string;
  private _system?: string;
  private _template?: (s: string) => string;
  private _format?: LLMFormat; // @TODO: Flesh this out to a proper format object

  constructor(
    name: string,
    stream: boolean,
    model = "qwen3",
    system?: string,
    template?: (s: string) => string,
    format?: LLMFormat,
    retryConfig: RetryConfig = { policy: "never" },
    onComplete?: OnCompleteCB
  ) {
    super(name, "llm", retryConfig, onComplete);
    this._stream = stream;
    this._model = model;
    if (system) this._system = system;
    if (template) this._template = template;
    if (format) this._format = format;
  }

  public inputs(): Record<string, InputPort> {
    return {
      prompt: { type: "string", required: true },
    };
  }

  public outputs(): Record<string, OutputPort> {
    return {
      output: { type: "string" },
    };
  }

  public async *execute(
    context: NodeContext
  ): AsyncIterable<ExecutionUpdate<{ output: string }>> {
    const prompt = this._template
      ? this._template(context.getInput<string>("prompt"))
      : context.getInput<string>("prompt");

    const history = [
      ...(this._system
        ? [{ role: "system" as const, content: this._system }]
        : []),
      ...context.graph.chatHistory,
      { role: "user" as const, content: prompt },
    ];
    try {
      const response = this._stream
        ? yield* this.streamChat(history)
        : yield* this.noStreamChat(history);

      context.setOutput("output", response);
      context.graph.chatHistory.push({
        role: "assistant",
        content: response,
      });
    } catch (e) {
      yield {
        nodeId: this.id,
        status: NodeStatus.Failed,
        error: e instanceof Error ? e.message : `${e}`,
      };
    }
  }

  public onComplete(
    result: { output: string },
    context: NodeContext
  ): void | Promise<void> {
    this.onCompleteCB?.(result, context);
  }

  private async *streamChat(
    history: ChatEntry[]
  ): AsyncGenerator<ExecutionUpdate<{ output: string }>, string, void> {
    const res = await ollama.chat({
      model: this._model,
      stream: true,
      messages: history,
      ...(this._format ? { format: this._format } : {}),
    });

    let full = "";
    for await (const r of res) {
      full += r.message.content;
      yield {
        nodeId: this.id,
        status: NodeStatus.InProgress,
        output: { output: r.message.content },
        final: false,
        partial: true,
      };
    }
    yield {
      status: NodeStatus.Completed,
      output: { output: full },
      final: true,
      nodeId: this.id,
    };

    return full;
  }

  private async *noStreamChat(
    history: ChatEntry[]
  ): AsyncGenerator<ExecutionUpdate<{ output: string }>, string, void> {
    const res = await ollama.chat({
      model: "qwen3",
      stream: false,
      messages: history,
      ...(this._format ? { format: this._format } : {}),
    });
    yield {
      status: NodeStatus.Completed,
      output: { output: res.message.content },
      final: true,
      nodeId: this.id,
    };
    return res.message.content;
  }
}
