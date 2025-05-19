import { GraphNode } from "./GraphNode";
import { Data, GraphContext, GraphNodeType } from "./types";

export class NodeContext {
  constructor(
    public readonly graph: GraphContext,
    private readonly node: GraphNode<GraphNodeType>,
    private readonly runtimeInputs: Data,
    private readonly runtimeOutputs: Data
  ) {}

  public static CreateNext(
    prevCtx: NodeContext,
    node: GraphNode<GraphNodeType>,
    inputs: Data,
    outputs: Data
  ): NodeContext {
    return new NodeContext(prevCtx.graph, node, inputs, outputs);
  }

  public static CreateBlank(graph: GraphContext) {
    return new NodeContext(
      graph,
      {
        id: "",
        inputs: () => ({}),
        outputs: () => ({}),
      } as any,
      {},
      {}
    );
  }

  getInput<T>(key: string): T | undefined {
    const schema = this.node.inputs()[key as string];
    if (this.runtimeInputs[key] !== undefined) return this.runtimeInputs[key];
    if (schema?.default !== undefined) return schema.default as T;
    if (schema?.required)
      throw new Error(`Missing required input: ${String(key)}`);
    return undefined;
  }

  setOutput(key: string, value: unknown): void {
    const schema = this.node.outputs()[key];
    if (!schema) {
      throw new Error(`Unknown output port: "${key}"`);
    }
    if (typeof value !== schema.type && schema.type !== "any") {
      throw new Error(
        `Type mismatch for output "${key}": expected ${
          schema.type
        }, got ${typeof value}`
      );
    }
    this.runtimeOutputs[key] = value;
  }

  getOutput<T>(key: string): T {
    return this.runtimeOutputs[key];
  }

  getOutputs() {
    return this.runtimeOutputs;
  }
}
