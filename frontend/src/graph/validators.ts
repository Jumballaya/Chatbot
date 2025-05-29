import type { IOType, Port } from "./types";
import { Connection, Edge, Node } from "@xyflow/react";

export function validateConnection(
  conn: Edge | Connection,
  nodes: Node[],
  edges: Edge[],
  connected = false
): string | null {
  const sourceNode = nodes.find((n) => n.id === conn.source);
  const targetNode = nodes.find((n) => n.id === conn.target);
  if (!sourceNode || !targetNode || !conn.sourceHandle || !conn.targetHandle) {
    return "Missing node of handle";
  }

  const sourceData = sourceNode.data.sources as Record<string, Port<IOType>>;
  const targetData = targetNode.data.targets as Record<string, Port<IOType>>;
  const source = sourceData?.[conn.sourceHandle];
  const target = targetData?.[conn.targetHandle];

  const sourceType = source.type;
  const targetType = target.type;

  if (!sourceType || !targetType) {
    return "Missing type information";
  }

  if (sourceType !== targetType) {
    return `Type mismatch: cannot connect ${sourceType} to ${targetType}`;
  }

  if (!connected) {
    const alreadyConnected = edges.some(
      (e) => e.target === conn.target && e.targetHandle === conn.targetHandle
    );
    if (alreadyConnected) {
      return `Input port '${conn.targetHandle}' is already connected`;
    }
  }

  return null;
}
