import {
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type Connection,
  applyEdgeChanges,
  applyNodeChanges,
} from "@xyflow/react";
import type { ExecutionGraph } from "../graph/ExecutionGraph";
import { Data } from "../graph/types";
import { createWithEqualityFn } from "zustand/traditional";
import { nanoid } from "nanoid";

export interface GraphState {
  nodes: Node[];
  edges: Edge[];

  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  // onNodesDelete: (nodes: Node[]) => void;
  // onEdgesDelete: (edges: Edge[]) => void;
  addEdge: (conn: Connection) => void;

  // updateNode: (id: string, partial: Data) => void;
  // createNode: (type: string) => void;
  // removeNode: (id: string) => void;

  // compiledGraphs: Record<string, ExecutionGraph>;
  // reactFlowGraphs: Record<string, { nodes: Node[]; edges: Edge[] }>;

  // activeGraphId: string | null;
  // setActiveGraph: (id: string | null) => void;

  // compileGraph: (id: string) => void;
  // getCompiledGraph: (id: string) => ExecutionGraph | undefined;
  // updateGraph: (id: string, nodes: Node[], edges: Edge[]) => void;
}

export const useGraphStore = createWithEqualityFn<GraphState>((set, get) => ({
  nodes: [
    { id: "a", data: { label: "oscillator" }, position: { x: 0, y: 0 } },
    { id: "b", data: { label: "gain" }, position: { x: 50, y: 50 } },
    { id: "c", data: { label: "output" }, position: { x: -50, y: 100 } },
  ],
  edges: [],

  onNodesChange(changes) {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  onEdgesChange(changes) {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  addEdge(data) {
    const id = nanoid(6);
    const edge = { id, ...data };
    set({ edges: [edge, ...get().edges] });
  },
}));
