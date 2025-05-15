import { GraphNode } from "./GraphNode";
import { NodeContext } from "./NodeContext";
import { OutputNode } from "./nodes/OutputNode";
import { PromptNode } from "./nodes/PromptNode";
import { StringNode } from "./nodes/StringNode";
import {
  ConditionalValue,
  ExecutionUpdate,
  GraphEdge,
  GraphNodeType,
  NodeId,
  NodeStatus,
  NodeConfig,
  GraphContext,
  Data,
} from "./types";
import { validateGraph } from "./validators";
import { GraphVariables } from "./GraphVariables";
import { LLMNode } from "./nodes/LLMNode";
import { NumberNode } from "./nodes/NumberNode";
import { BooleanNode } from "./nodes/BooleanNode";

type GenericNode = GraphNode<GraphNodeType>;

//
//  Get the variable stuff out and into a graph variable manager
//  class. It will be expanded on later when I do external variables
//  and imported/exported variables (to turn the whole graph into
//  its own node for another graph).
//
//  Focus on rebuilding the graph around the react-flow data.
//  Rewrite the data that the nodes have and mark the inputs/outputs
//  type, values, names and if they are connect or not. No required
//  ports for now. Make the ports mirror react-flow.
//
//  Simplify the class API and try to meld types where possible. Try
//  to reduce the types used and reduce the usage of the any type
//
//  Figure out a solution to running the graph, start at terminal nodes
//  like the output node and work backwards? Start at input nodes like
//  literals and variables and work forward? If the second then I will
//  need to make a robust lifecycle where the graph waits for ports to
//  be ready before moving on with any ports that require their output
//  and only then continue on. That means I can work on parts of the
//  graph as they are ready, and in order. Keeping the DAG structure
//  while eventually opening the door for multithreaded.
//

export class ExecutionGraph {
  public globals = new GraphVariables();
  private nodeExecutionContexts = new Map<NodeId, NodeContext>();

  public nodes: Map<NodeId, GenericNode> = new Map();
  public edges: GraphEdge[] = [];
  private root: NodeId = "";
  //  @TODO: maybe re-write root system this so we find
  // the left-most node (the highest parent) or come up
  // with a permanent root node and end node that come with all graphs?

  // currently assumes you start with a string node -> prompt -> llm -> output
  public addNode(config: NodeConfig): void {
    switch (config.type) {
      case "prompt": {
        const { name, retry, onComplete } = config;
        const node = new PromptNode(name, retry, onComplete);
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
      case "number": {
        const { name, retry, onComplete } = config;
        const node = new NumberNode(name, retry, onComplete);
        if (this.root === "") this.root = node.id;
        this.nodes.set(node.id, node);
        break;
      }
      case "boolean": {
        const { name, retry, onComplete } = config;
        const node = new BooleanNode(name, retry, onComplete);
        if (this.root === "") this.root = node.id;
        this.nodes.set(node.id, node);
        break;
      }
      case "output": {
        const { name, retry, onComplete } = config;
        const node = new OutputNode(name, retry, onComplete);
        this.nodes.set(node.id, node);
        break;
      }
      case "llm": {
        const { name, retry, onComplete, model, stream, system } = config;
        const node = new LLMNode(
          name,
          stream ?? false,
          model,
          system,
          undefined,
          undefined,
          retry,
          onComplete
        );
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

  // @TODO: Make sure we set the connected value on the port when
  //        adding/removing edges.
  //
  public addEdge(edge: GraphEdge): void {
    const fromNode = this.nodes.get(edge.fromNode);
    const toNode = this.nodes.get(edge.toNode);
    if (!fromNode || !toNode) {
      throw new Error("Invalid node reference");
    }

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

  // @TODO: Make sure we set the connected value on the port when
  //        adding/removing edges.
  //
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

  public async *execute(): AsyncIterable<ExecutionUpdate> {
    this.nodeExecutionContexts.clear();
    const graphCtx: GraphContext = {
      chatHistory: [
        { role: "system", content: "You are a helpful assistant." },
      ],
      global: this.globals.variables,
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
    const node = this.nodes.get(this.root)!;
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

  public clear() {
    this.nodes.clear();
    this.edges.length = 0;
    this.root = "";
  }

  // @TODO: Make sure this will resolve inputs correctly
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
