import { nanoid } from "nanoid";
import { GraphNode } from "./GraphNode";
import { NodeContext } from "./NodeContext";
import { IfNode } from "./nodes/IfNode";
import { LLMNode } from "./nodes/LLMNode";
import { OutputNode } from "./nodes/OutputNode";
import { PromptNode } from "./nodes/PromptNode";
import { StringNode } from "./nodes/StringNode";
import { ToolCallNode } from "./nodes/ToolCallNode";
import { ToolNode } from "./nodes/ToolNode";
import {
  ConditionalValue,
  ExecutionUpdate,
  GraphEdge,
  GraphNodeType,
  NodeId,
  NodeStatus,
  NodeConfig,
  GraphContext,
  VariableDef,
  VariableValue,
  VariableType,
  Data,
} from "./types";
import { validateGraph } from "./validators";
import { VariableNode } from "./nodes/VariableNode";

type GenericNode = GraphNode<GraphNodeType>;

export class ExecutionGraph {
  private _definitions: Record<string, VariableDef> = {};
  private _variables: Record<string, VariableValue> = {};

  private nodeExecutionContexts = new Map<NodeId, NodeContext>();
  public readonly variables: Record<string, VariableValue>;

  public nodes: Map<NodeId, GenericNode> = new Map();
  public edges: GraphEdge[] = [];
  private root: NodeId = "";
  //  @TODO: maybe re-write root system this so we find
  // the left-most node (the highest parent) or come up
  // with a permanent root node and end node that come with all graphs?

  constructor() {
    this.variables = new Proxy(this._variables, {
      get: (target, key: string) => target[key],
      set: (target, key: string, value) => {
        const def = this._definitions[key];
        if (!def) throw new Error(`Variable '${key}' not defined`);
        if (typeof value !== def.type) {
          throw new TypeError(`Expected '${key}' to be type ${def.type}`);
        }
        target[key] = value;
        return true;
      },
    });
  }

  public setRoot(id: NodeId) {
    if (this.nodes.has(id)) {
      this.root = id;
    }
  }

  public getRoot() {
    return this.nodes.get(this.root);
  }

  public addNode(config: NodeConfig): void {
    switch (config.type) {
      case "prompt": {
        const { name, retry, onComplete } = config;
        const node = new PromptNode(name, retry, onComplete);
        if (this.root === "") this.root = node.id;
        this.nodes.set(node.id, node);
        break;
      }
      case "string": {
        const { name, retry, onComplete } = config;
        const node = new StringNode(name, retry, onComplete);
        if (this.root === "") this.root = node.id;
        this.nodes.set(node.id, node);
        break;
      }
      case "llm": {
        const {
          name,
          retry,
          stream,
          onComplete,
          model,
          system,
          template,
          format,
        } = config;
        const node = new LLMNode(
          name,
          stream ?? false,
          model,
          system,
          template,
          format,
          retry,
          onComplete
        );
        if (this.root === "") this.root = node.id;
        this.nodes.set(node.id, node);
        break;
      }
      case "output": {
        const { name, retry, onComplete } = config;
        const node = new OutputNode(name, retry, onComplete);
        if (this.root === "") this.root = node.id;
        this.nodes.set(node.id, node);
        break;
      }
      case "if": {
        const { name, retry, onComplete, statement } = config;
        const node = new IfNode(name, statement, retry, onComplete);
        if (this.root === "") this.root = node.id;
        this.nodes.set(node.id, node);
        break;
      }
      case "tool-call": {
        const { name, retry, tools, onComplete, model } = config;
        const node = new ToolCallNode(name, tools, model, retry, onComplete);
        this.nodes.set(node.id, node);
        break;
      }

      case "tool": {
        const { name, retry, impl, onComplete } = config;
        const node = new ToolNode(name, impl, retry, onComplete);
        this.nodes.set(node.id, node);
        break;
      }

      case "variable": {
        const { name, retry, onComplete } = config;
        const node = new VariableNode(name, retry, onComplete);
        if (this.root === "") this.root = node.id;
        this.nodes.set(node.id, node);
        break;
      }
    }
  }

  public removeNode(id: string) {
    this.nodeExecutionContexts.delete(id);
    this.nodes.delete(id);
    if (this.root === id) {
      this.root = "";
    }
    this.edges = this.edges.filter((e) => {
      return e.fromNode !== id && e.toNode !== id;
    });
  }

  public addEdge(edge: GraphEdge): void {
    const fromNode = this.nodes.get(edge.fromNode);
    const toNode = this.nodes.get(edge.toNode);
    if (!fromNode || !toNode) throw new Error("Invalid node reference");

    const fromPorts = fromNode.outputs();
    const toPorts = toNode.inputs();

    const fromPort = fromPorts[edge.fromPort];
    const toPort = toPorts[edge.toPort];

    if (!fromPort) {
      throw new Error(`Output port "${edge.fromPort}" does not exist`);
    }
    if (!toPort) {
      throw new Error(`Input port "${edge.toPort}" does not exist`);
    }

    if (fromPort.type !== toPort.type && toPort.type !== "any") {
      throw new Error(`Port type mismatch: ${fromPort.type} -> ${toPort.type}`);
    }

    if (
      this.edges.find((e) => {
        return (
          e.fromNode === edge.fromNode &&
          e.fromPort === edge.fromPort &&
          e.toNode === edge.toNode &&
          e.toPort === edge.toPort
        );
      })
    ) {
      return;
    }

    if (
      this.edges.find((e) => {
        return e.toNode === edge.toNode && e.toPort === edge.toPort;
      })
    ) {
      throw new Error(
        `Input port "${edge.toPort}" on node ${edge.toNode} already connected`
      );
    }

    this.edges.push(edge);
  }

  public removeEdge(edge: GraphEdge) {
    this.edges = this.edges.filter(
      (e) =>
        !(
          e.fromNode === edge.fromNode &&
          e.fromPort === edge.fromPort &&
          e.toNode === edge.toNode &&
          e.toPort === edge.toPort
        )
    );
  }

  getEdgesTo(nodeId: NodeId): GraphEdge[] {
    return this.edges.filter((e) => e.toNode === nodeId);
  }

  getEdgesFrom(nodeId: NodeId): GraphEdge[] {
    return this.edges.filter((e) => e.fromNode === nodeId);
  }

  getEdgeFeedingPort(nodeId: NodeId, port: string): GraphEdge | undefined {
    return this.edges.find((e) => e.toNode === nodeId && e.toPort === port);
  }

  public addVariable(
    name: string,
    type: VariableType,
    initial?: VariableValue
  ) {
    if (name in this._definitions) {
      throw new Error(`Variable '${name}' already exists`);
    }
    const defaultValue: VariableValue =
      initial ??
      (type === "number"
        ? 0
        : type === "string"
        ? ""
        : type === "boolean"
        ? false
        : "");

    const id = nanoid(8);
    this._definitions[id] = { id, name, type, value: defaultValue };
    this._variables[name] = defaultValue;
    return id;
  }

  public updateVariable(
    id: string,
    variable: Partial<Omit<VariableDef, "id">>
  ) {
    const newName = variable.name;
    if (newName) {
      const exists = Object.values(this._definitions).some(
        (d) => d.id !== id && d.name === newName
      );
      if (exists) return;
    }
    if (!(id in this._definitions)) return;

    this._definitions[id] = {
      ...this._definitions[id],
      ...variable,
    };
  }

  public getVariable<T extends VariableValue>(name: string): T | undefined {
    const found = this._definitions[name];
    if (found) return found.value as T;
  }

  public hasVariableId(id: string) {
    return id in this._definitions;
  }

  public removeVariable(name: string) {
    delete this._definitions[name];
    delete this._variables[name];
  }

  public setVariable(name: keyof typeof this._variables, value: VariableValue) {
    this.variables[name] = value;
  }

  public getVariables() {
    return this._definitions;
  }

  // Specifically processes a prompt, so it is designed around that
  // @TODO: Later on create a generic execute, and use graph global
  // variables to expose graph-level inputs/outputs
  // (public vs private variables in the graphCTX)
  public async *process(prompt: string): AsyncIterable<ExecutionUpdate> {
    this.nodeExecutionContexts.clear();
    const graphCtx: GraphContext = {
      chatHistory: [
        { role: "system", content: "You are a helpful assistant." },
      ],
      global: this.variables,
    };

    try {
      this.validate();
    } catch (e) {
      yield {
        nodeId: "",
        status: NodeStatus.Failed,
        error: e instanceof Error ? e.message : "Graph not valid",
      };
      return;
    }

    const rootNode = this.nodes.get(this.root);
    if (!rootNode) {
      yield {
        nodeId: "",
        status: NodeStatus.Failed,
        error: "No root node present",
      };
      return;
    }

    const queue: Array<[GenericNode, NodeContext]> = [];
    this.addNode({
      type: "string",
      name: "graph-entry",
    });
    const node = this.nodes.get("graph-entry")! as StringNode;
    node.string = prompt;
    this.nodes.set(node.id, node);
    this.addEdge({
      fromNode: node.id,
      toNode: rootNode.id,
      fromPort: "string",
      toPort: "input", // hard-coded for now, assumes a PromptNode
    });
    const ctx = new NodeContext(graphCtx, node, {}, {});
    this.nodeExecutionContexts.set(node.id, ctx);

    queue.push([node, ctx]);

    while (queue.length > 0) {
      const item = queue.pop();
      if (!item) break;
      const [next, prevCtx] = item;
      const inputs = this.resolveInputsForNode(next);
      const outputs = this.createDefaultOutputsForNode(next);
      const ctx = NodeContext.CreateNext(prevCtx, next, inputs, outputs);

      yield {
        nodeId: next.id,
        status: NodeStatus.InProgress,
      };

      let failed = false;
      for await (const update of next.execute(ctx)) {
        yield update;
        if (update.status === NodeStatus.Failed) failed = true;
      }

      const connections = this.findConnections(next.id);

      // Handle branching logic
      let filtered = connections;

      // 'IF' logic
      if (next.type === "if") {
        const tag = ctx.getOutput<string>("result") ? "true" : "false";
        filtered = connections.filter(
          (conn) => this.getEdgeCondition(next.id, conn.id) === tag
        );
      }

      // 'ToolCall' logic
      if (next.type === "tool-call") {
        const selected = ctx.getOutput<string>("selectedTool");
        filtered = connections.filter(
          (conn) => this.getEdgeCondition(next.id, conn.id) === selected
        );
      }

      this.nodeExecutionContexts.set(next.id, ctx);

      for (const node of filtered) {
        const inputs = this.resolveInputsForNode(node);
        const outputs = this.createDefaultOutputsForNode(node);
        const ctx = NodeContext.CreateNext(
          new NodeContext(graphCtx, node, {}, {}),
          node,
          inputs,
          outputs
        );
        queue.unshift([node, ctx]);
      }

      if (!failed) next.onComplete(ctx.getOutputs(), ctx);
    }
  }

  private resolveInputsForNode(node: GenericNode): Data {
    const inputs: Data = {};
    const inputPorts = node.inputs();

    for (const key of Object.keys(inputPorts)) {
      const edge = this.edges.find(
        (e) => e.toNode === node.id && e.toPort === key
      );

      if (!edge) {
        const schema = inputPorts[key];
        if (schema?.default !== undefined) {
          inputs[key] = schema.default;
        } else if (schema?.required) {
          throw new Error(
            `Missing required input "${key}" for node "${node.id}"`
          );
        }
        continue;
      }

      const fromCtx = this.nodeExecutionContexts.get(edge.fromNode);
      if (!fromCtx) {
        throw new Error(`Missing context for upstream node ${edge.fromNode}`);
      }
      inputs[key] = fromCtx.getOutput(edge.fromPort);
    }
    return inputs;
  }

  private createDefaultOutputsForNode(
    node: GenericNode
  ): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const [key, port] of Object.entries(node.outputs())) {
      if (port.type === "string") out[key] = "";
      else if (port.type === "number") out[key] = 0;
      else if (port.type === "boolean") out[key] = false;
      else out[key] = null;
    }
    return out;
  }

  private findConnections(id: NodeId): GenericNode[] {
    const edgeList = this.edges.filter((edge) => edge.fromNode === id);
    const downstream = new Set<GenericNode>();

    for (const edge of edgeList) {
      const node = this.nodes.get(edge.toNode);
      if (node) {
        downstream.add(node);
      }
    }

    return Array.from(downstream);
  }

  private validate() {
    validateGraph(this);
  }

  private getEdgeCondition(
    from: NodeId,
    to: NodeId
  ): ConditionalValue | undefined {
    // edges array is small per node, linear scan is fine
    for (const e of this.edges) {
      if (e.fromNode === from && e.toNode === to) return e.condition;
    }
    return undefined;
  }
}
