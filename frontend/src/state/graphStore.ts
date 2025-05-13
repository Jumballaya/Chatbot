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
import type { VariableDef, GraphNodeType, Data } from "../graph/types";

export interface GraphState {
  nodes: Node[];
  edges: Edge[];
  activeGraphId: string | null;
  graphs: Record<string, { compiled: boolean; graph: ExecutionGraph }>;

  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  addEdge: (conn: Connection) => void;

  updateNode: (id: string, partial: Data) => void;
  createNode: (type: GraphNodeType) => void;

  setActiveGraph: (id: string | null) => void;
  getActiveGraph: () => ExecutionGraph;

  compileGraph: (id: string) => void;
  getCompiledGraph: (id: string) => ExecutionGraph | undefined;
  getGraph: (id: string) => ExecutionGraph | undefined;
  getVariableList: () => VariableDef[];
}

export const useGraphStore = createWithEqualityFn<GraphState>((set, get) => ({
  nodes: [],
  edges: [],
  graphs: {
    default: {
      compiled: false,
      graph: (() => {
        const graph = new ExecutionGraph();
        graph.addVariable("initial_prompt", "string", "Why is the sky blue?");
        graph.addVariable("llm_model", "string", "gemma3:4b");
        return graph;
      })(),
    },
  },
  activeGraphId: "default",

  onNodesChange(changes) {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  onEdgesChange(changes) {
    console.log(changes);
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  createNode(type: GraphNodeType) {
    const id = nanoid(8);
    switch (type) {
      case "output": {
        const node = {
          type: "out",
          id,
          data: {
            text: "",
          },
          position: { x: 100, y: 100 },
        };
        set({ nodes: [...get().nodes, node] });
        break;
      }
      case "prompt": {
        const node = {
          type,
          id,
          data: {
            prompt: "",
          },
          position: { x: 100, y: 100 },
        };
        set({ nodes: [...get().nodes, node] });
        break;
      }
      case "llm": {
        const node = {
          type,
          id,
          data: {
            model: "",
            system: "",
            stream: false,
          },
          position: { x: 100, y: 100 },
        };
        set({ nodes: [...get().nodes, node] });
        break;
      }
      case "variable": {
        const node = {
          type,
          id,
          data: {
            variableName: "",
          },
          position: { x: 100, y: 100 },
        };
        set({ nodes: [...get().nodes, node] });
        break;
      }
    }
  },

  updateNode(id, partial) {
    set({
      nodes: get().nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, ...partial } } : node
      ),
    });
  },

  addEdge(data) {
    const state = get();
    const source = state.nodes.find((n) => n.id === data.source);
    const target = state.nodes.find((n) => n.id === data.target);
    if (source && target && data.sourceHandle && data.targetHandle) {
      const value = source.data[data.sourceHandle];
      state.updateNode(target.id, {
        [data.targetHandle]: value,
      });
    }

    const id = nanoid(6);
    const edge = { id, ...data };
    set({ edges: [edge, ...state.edges] });
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

  getActiveGraph() {
    const state = get();
    return state.graphs[state.activeGraphId ?? "default"].graph;
  },

  getVariableList() {
    const state = get();
    return Object.values(
      state.graphs[state.activeGraphId ?? "default"].graph.getVariables()
    );
  },
}));
