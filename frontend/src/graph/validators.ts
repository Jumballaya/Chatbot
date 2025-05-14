import type { Data, NodeId } from "./types";
import type { ExecutionGraph } from "./ExecutionGraph";
import { Connection, Edge, Node } from "@xyflow/react";

export function validateGraph(graph: ExecutionGraph): void {
  validateRequiredInputs(graph);
  validateInputFanIn(graph);
  validatePortExistenceAndTypes(graph);
  validateAcyclicGraph(graph);
}

export function validateRequiredInputs(graph: ExecutionGraph): void {
  for (const node of graph.nodes.values()) {
    for (const [inputKey, port] of Object.entries(node.inputs())) {
      const hasEdge = graph.edges.some(
        (e) => e.toNode === node.id && e.toPort === inputKey
      );
      if (!hasEdge && port.required && port.default === undefined) {
        throw new Error(
          `Missing required input "${inputKey}" on node "${node.id}"`
        );
      }
    }
  }
}

export function validateInputFanIn(graph: ExecutionGraph): void {
  for (const node of graph.nodes.values()) {
    const seen = new Map<string, number>();
    for (const edge of graph.edges.filter((e) => e.toNode === node.id)) {
      seen.set(edge.toPort, (seen.get(edge.toPort) ?? 0) + 1);
    }

    for (const [port, count] of seen.entries()) {
      if (count > 1) {
        throw new Error(
          `Input port "${port}" on node "${node.id}" has multiple edges`
        );
      }
    }
  }
}

export function validatePortExistenceAndTypes(graph: ExecutionGraph): void {
  for (const edge of graph.edges) {
    const fromNode = graph.nodes.get(edge.fromNode);
    const toNode = graph.nodes.get(edge.toNode);

    if (!fromNode) throw new Error(`Unknown fromNodeId "${edge.fromNode}"`);
    if (!toNode) throw new Error(`Unknown toNodeId "${edge.toNode}"`);

    const fromPort = fromNode.outputs()[edge.fromPort];
    const toPort = toNode.inputs()[edge.toPort];

    if (!fromPort)
      throw new Error(
        `Output port "${edge.fromPort}" missing on node "${fromNode.id}"`
      );
    if (!toPort)
      throw new Error(
        `Input port "${edge.toPort}" missing on node "${toNode.id}"`
      );

    if (fromPort.type !== toPort.type && toPort.type !== "any") {
      throw new Error(
        `Type mismatch: ${fromNode.id}.${edge.fromPort} (${fromPort.type}) → ${toNode.id}.${edge.toPort} (${toPort.type})`
      );
    }
  }
}

export function validateAcyclicGraph(graph: ExecutionGraph): void {
  const visited = new Set<NodeId>();
  const stack = new Set<NodeId>();

  const dfs = (id: NodeId): void => {
    if (stack.has(id)) throw new Error(`Cycle detected at node "${id}"`);
    if (visited.has(id)) return;

    visited.add(id);
    stack.add(id);

    for (const edge of graph.edges.filter((e) => e.fromNode === id)) {
      dfs(edge.toNode);
    }

    stack.delete(id);
  };

  for (const node of graph.nodes.values()) {
    dfs(node.id);
  }
}

export function validateConnection(
  conn: Edge | Connection,
  nodes: Node[],
  edges: Edge[]
): string | null {
  const sourceNode = nodes.find((n) => n.id === conn.source);
  const targetNode = nodes.find((n) => n.id === conn.target);
  if (!sourceNode || !targetNode || !conn.sourceHandle || !conn.targetHandle) {
    return "Missing node of handle";
  }

  const sourceType = (sourceNode.data?.sources as Data)?.[conn.sourceHandle]
    ?.type;
  const targetType = (targetNode.data?.targets as Data)?.[conn.targetHandle]
    ?.type;

  if (!sourceType || !targetType) {
    return "Missing type information";
  }

  if (
    sourceType !== targetType &&
    sourceType !== "any" &&
    targetType !== "any"
  ) {
    return `Type mismatch: cannot connect ${sourceType} to ${targetType}`;
  }

  const alreadyConnected = edges.some(
    (e) => e.target === conn.target && e.targetHandle === conn.targetHandle
  );
  if (alreadyConnected) {
    return `Input port '${conn.targetHandle}' is already connected`;
  }

  return null;
}
