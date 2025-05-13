import {
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type Connection,
  applyEdgeChanges,
  applyNodeChanges,
} from "@xyflow/react";
import { ExecutionGraph } from "../graph/ExecutionGraph";
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

  // reactFlowGraphs: Record<string, { nodes: Node[]; edges: Edge[] }>;

  activeGraphId: string | null;
  setActiveGraph: (id: string | null) => void;
  // updateGraph: (id: string, nodes: Node[], edges: Edge[]) => void;

  graphs: Record<string, { compiled: boolean; graph: ExecutionGraph }>;
  compileGraph: (id: string) => void;
  getCompiledGraph: (id: string) => ExecutionGraph | undefined;
  getGraph: (id: string) => ExecutionGraph | undefined;
}

export const useGraphStore = createWithEqualityFn<GraphState>((set, get) => ({
  nodes: [
    { type: "prompt", id: "a", data: {}, position: { x: 100, y: 100 } },
    { type: "variable", id: "b", data: {}, position: { x: 100, y: 100 } },
    { type: "variable", id: "c", data: {}, position: { x: 100, y: 100 } },
    { type: "out", id: "d", data: {}, position: { x: 100, y: 100 } },
    { type: "llm", id: "e", data: {}, position: { x: 100, y: 100 } },
  ],
  edges: [],
  graphs: {
    default: {
      compiled: false,
      graph: new ExecutionGraph(),
    },
  },
  activeGraphId: "default",

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

  compileGraph(id) {
    const { nodes, edges, graphs } = get();
    const graph = graphs[id].graph ?? new ExecutionGraph();

    // for (const node of nodes) {
    //   graph.addNodeFromReactFlow(node);
    // }

    // for (const edge of edges) {
    //   graph.addEdge({
    //     fromNode: edge.source,
    //     toNode: edge.target,
    //     fromPort: edge.sourceHandle ?? "output",
    //     toPort: edge.targetHandle ?? "input",
    //   });
    // }

    set((s) => ({
      graphs: {
        ...s.graphs,
        [id]: { compiled: true, graph },
      },
    }));
  },

  getCompiledGraph(id) {
    const entry = get().graphs[id];
    if (entry.compiled) return entry.graph;
  },

  getGraph(id) {
    return get().graphs[id]?.graph;
  },

  setActiveGraph(id) {
    set({ activeGraphId: id });
  },
}));
