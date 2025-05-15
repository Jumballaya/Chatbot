import { Ollama } from "ollama";
import {
  ExecutionUpdate,
  NodeStatus,
  RetryConfig,
  OnCompleteCB,
  ChatEntry,
  LLMFormat,
  InputPort,
  OutputPort,
} from "../types";
import { GraphNode } from "../GraphNode";
import { NodeContext } from "../NodeContext";

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

  public set stream(s: boolean) {
    this._stream = s;
  }

  public set model(m: string) {
    this._model = m;
  }

  public set system(s: string) {
    this._system = s;
  }

  public inputs(): Record<string, InputPort> {
    return {
      prompt: {
        type: "string",
        required: true,
      },
      model: {
        type: "string",
      },
      system: {
        type: "string",
      },
      stream: {
        type: "boolean",
      },
    };
  }

  public outputs(): Record<string, OutputPort> {
    return {
      llm_output: { type: "string" },
    };
  }

  public async *execute(
    context: NodeContext
  ): AsyncIterable<ExecutionUpdate<{ llm_output: string }>> {
    const prompt = this._template
      ? this._template(context.getInput<string>("prompt")!)
      : context.getInput<string>("prompt");
    const model = this._model ? this._model : context.getInput<string>("model");

    const history = [
      ...(this._system
        ? [{ role: "system" as const, content: this._system }]
        : []),
      ...context.graph.chatHistory,
      { role: "user" as const, content: prompt ?? "" },
    ];
    try {
      const response = this._stream
        ? yield* this.streamChat(model ?? "gemma3:4b", history)
        : yield* this.noStreamChat(model ?? "gemma3:4b", history);

      context.setOutput("llm_output", response);
      context.graph.chatHistory.push({
        role: "assistant",
        content: response,
      });
    } catch (e) {
      yield {
        status: NodeStatus.Failed,
        nodeId: this.id,
        error: e instanceof Error ? e.message : `${e}`,
      };
    }
  }

  public onComplete(
    result: { llm_output: string },
    context: NodeContext
  ): void | Promise<void> {
    this.onCompleteCB?.(result, context);
  }

  private async *streamChat(
    model: string,
    history: ChatEntry[]
  ): AsyncGenerator<ExecutionUpdate<{ llm_output: string }>, string, void> {
    const res = await ollama.chat({
      model,
      stream: true,
      messages: history,
      ...(this._format ? { format: this._format } : {}),
    });

    let full = "";
    for await (const r of res) {
      full += r.message.content;
      yield {
        status: NodeStatus.InProgress,
        nodeId: this.id,
        output: { llm_output: r.message.content },
        final: false,
        partial: true,
      };
    }
    yield {
      status: NodeStatus.Completed,
      output: { llm_output: full },
      final: true,
      nodeId: this.id,
    };

    return full;
  }

  private async *noStreamChat(
    model: string,
    history: ChatEntry[]
  ): AsyncGenerator<ExecutionUpdate<{ llm_output: string }>, string, void> {
    const res = await ollama.chat({
      model,
      stream: false,
      messages: history,
      ...(this._format ? { format: this._format } : {}),
    });
    yield {
      status: NodeStatus.Completed,
      output: { llm_output: res.message.content },
      final: true,
      nodeId: this.id,
    };
    return res.message.content;
  }
}
