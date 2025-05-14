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
import type {
  VariableDef,
  GraphNodeType,
  Data,
  VariableValue,
  VariableType,
} from "../graph/types";
import { validateConnection } from "../graph/validators";

export interface GraphState {
  nodes: Node[];
  edges: Edge[];
  activeGraphId: string | null;
  graphs: Record<string, { compiled: boolean; graph: ExecutionGraph }>;

  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onEdgesDelete: (edges: Edge[]) => void;
  handleConnect: (connection: Connection) => void;
  addEdge: (conn: Connection) => void;
  setEdges: (edges: Edge[]) => void;
  isValidConnection: (connection: Edge | Connection) => boolean;

  updateNode: (id: string, partial: Data, removedEdges?: boolean) => void;
  createNode: (type: GraphNodeType) => void;
  setNodeValue: (
    id: string,
    port: string,
    direction: "targets" | "sources",
    value: VariableValue
  ) => void;
  getNodeValue(
    id: string,
    port: string,
    direction: "sources" | "targets"
  ):
    | { type: VariableType; connected: boolean; value: VariableValue }
    | undefined;
  removeInvalidEdges: (id: string) => void;
  propagateValueToDownstream: (
    sourceId: string,
    sourcePort: string,
    value: unknown
  ) => void;

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
        graph.addVariable("test123", "number", 10);
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
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  handleConnect(connection: Connection) {
    const { nodes, edges, addEdge } = useGraphStore.getState();
    const error = validateConnection(connection, nodes, edges);
    if (error) {
      console.warn("Connection rejected:", error);
      return;
    }
    addEdge(connection);
  },

  isValidConnection(connection: Edge | Connection): boolean {
    const { nodes, edges } = useGraphStore.getState();
    return validateConnection(connection, nodes, edges) === null;
  },

  createNode(type: GraphNodeType) {
    const id = nanoid(8);
    switch (type) {
      case "output": {
        const node = {
          type: "out",
          id,
          data: {
            targets: {
              input: {
                connected: false,
                type: "string",
                value: "",
              },
            },
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
            targets: {
              input: {
                type: "string",
                value: "",
                connected: false,
              },
            },
            sources: {
              prompt: {
                type: "string",
                value: "",
                connected: false,
              },
            },
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
            targets: {
              prompt: {
                connected: false,
                type: "string",
                value: "",
              },
              model: {
                connected: false,
                type: "string",
                value: "",
              },
              system: {
                connected: false,
                type: "string",
                value: "",
              },
              stream: {
                connected: false,
                type: "boolean",
                value: false,
              },
            },

            sources: {
              llm_output: {
                connected: false,
                type: "string",
                value: "",
              },
            },
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
            sources: {
              output: {
                connected: false,
                type: "string",
                value: "",
              },
            },
          },
          position: { x: 100, y: 100 },
        };
        set({ nodes: [...get().nodes, node] });
        break;
      }
      case "number": {
        const node = {
          type,
          id,
          data: {
            sources: {
              number: {
                connected: false,
                type: "number",
                value: 0,
              },
            },
          },
          position: { x: 100, y: 100 },
        };
        set({ nodes: [...get().nodes, node] });
        break;
      }
      case "string": {
        const node = {
          type,
          id,
          data: {
            sources: {
              string: {
                connected: false,
                type: "string",
                value: "",
              },
            },
          },
          position: { x: 100, y: 100 },
        };
        set({ nodes: [...get().nodes, node] });
        break;
      }
      case "boolean": {
        const node = {
          type,
          id,
          data: {
            sources: {
              boolean: {
                connected: false,
                type: "boolean",
                value: false,
              },
            },
          },
          position: { x: 100, y: 100 },
        };
        console.log(node);
        set({ nodes: [...get().nodes, node] });
        break;
      }
    }
  },

  updateNode(id, partial, removeEdges = true) {
    set({
      nodes: get().nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, ...partial } } : node
      ),
    });

    if (removeEdges) {
      get().removeInvalidEdges(id);
    }
  },

  setNodeValue(id, port, direction, value) {
    const node = get().nodes.find((n) => n.id === id);
    if (!node) return;
    const data = node.data as Data;
    if (!data[direction]) return;

    get().updateNode(id, {
      [direction]: {
        ...data[direction],
        [port]: {
          ...data[direction][port],
          value,
        },
      },
    });
    get().propagateValueToDownstream(id, port, value);
  },

  getNodeValue(id, port, direction) {
    const node = get().nodes.find((n) => n.id === id);
    if (!node) return;
    const data = node.data as Data;
    if (!data[direction]) return;
    const val = data[direction][port];
    return {
      type: val.type,
      value: val.value,
      connected: val.connected,
    };
  },

  addEdge(data) {
    const state = get();
    const source = state.nodes.find((n) => n.id === data.source);
    const target = state.nodes.find((n) => n.id === data.target);

    if (source && target && data.sourceHandle && data.targetHandle) {
      const value = (source.data.sources as Data)[data.sourceHandle].value;
      state.updateNode(target.id, {
        targets: {
          ...(target.data.targets as Data),
          [data.targetHandle]: {
            ...(target.data.targets as Data)[data.targetHandle],
            connected: true,
            value,
          },
        },
      });
      state.propagateValueToDownstream(target.id, data.targetHandle, value);
    }

    const id = nanoid(6);
    const edge = { id, ...data };
    set({ edges: [edge, ...state.edges] });
  },

  setEdges(edges) {
    set({ edges });
  },

  onEdgesDelete(deleted) {
    const state = get();
    for (const edge of deleted) {
      const { targetHandle } = edge;
      const target = state.nodes.find((n) => n.id === edge.target);
      if (target && targetHandle) {
        state.updateNode(target.id, {
          targets: {
            ...(target.data.targets as Data),
            [targetHandle]: {
              ...(target.data.targets as Data)[targetHandle],
              connected: false,
              value: "",
            },
          },
        });
        state.propagateValueToDownstream(target.id, targetHandle, "");
      }
    }

    set((s) => ({
      edges: s.edges.filter((e) => !deleted.some((d) => d.id === e.id)),
    }));
  },

  propagateValueToDownstream(
    sourceId: string,
    sourcePort: string,
    value: unknown
  ) {
    const state = get();
    const edges = state.edges.filter(
      (e) => e.source === sourceId && e.sourceHandle === sourcePort
    );

    for (const edge of edges) {
      const target = state.nodes.find((n) => n.id === edge.target);
      if (!target || !edge.targetHandle) continue;

      const targetPort = edge.targetHandle;
      const newTargets = {
        ...(target.data.targets as Data),
        [targetPort]: {
          ...(target.data.targets as Data)[targetPort],
          value,
          connected: true,
        },
      };

      state.updateNode(target.id, { targets: newTargets });
      state.propagateValueToDownstream(target.id, targetPort, value);
    }
  },

  removeInvalidEdges(id) {
    const { nodes, edges, setEdges, updateNode } = useGraphStore.getState();

    const node = nodes.find((n) => n.id === id);
    if (!node) return;

    const nextEdges: Edge[] = [];
    const removedEdges: Edge[] = [];

    for (const edge of edges) {
      if (edge.source === id || edge.target === id) {
        const error = validateConnection(edge, nodes, edges, true);
        if (error) {
          console.warn(`Edge ${edge.id} removed: ${error}`);
          removedEdges.push(edge);
          continue;
        }
      }
      nextEdges.push(edge);
    }

    for (const edge of removedEdges) {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      const targetNode = nodes.find((n) => n.id === edge.target);
      const sourcePort = (sourceNode?.data?.sources as Data)[
        edge.sourceHandle ?? ""
      ];
      const targetPort = (targetNode?.data?.targets as Data)[
        edge.targetHandle ?? ""
      ];
      if (sourceNode && sourcePort && edge.sourceHandle) {
        sourcePort.connected = false;
        updateNode(
          sourceNode.id,
          {
            sources: {
              ...(sourceNode.data.sources as object),
              [edge.sourceHandle]: {
                ...sourcePort,
                connected: false,
              },
            },
          },
          false
        );
      }
      if (targetNode && targetPort && edge.targetHandle) {
        updateNode(
          targetNode.id,
          {
            targets: {
              ...(targetNode.data.targets as object),
              [edge.targetHandle]: {
                ...targetPort,
                connected: false,
                value:
                  targetPort.type === "string"
                    ? ""
                    : targetPort.type === "number"
                    ? 0
                    : false,
              },
            },
          },
          false
        );
      }
    }

    setEdges(nextEdges);
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
