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
  PortDirection,
  IOTypeMap,
  IOType,
  Port,
} from "../graph/types";
import { validateConnection } from "../graph/validators";
import type { GraphData } from "../components/graph/types";
import { createInitialNode } from "../graph/reactNodeFactory";
import { addNodeFromReactFlow } from "../graph/reactFlowAdapter";

export interface GraphState {
  nodes: Node<GraphData>[];
  edges: Edge[];
  activeGraphId: string | null;
  graphs: Record<string, { compiled: boolean; graph: ExecutionGraph }>;

  onNodesChange: OnNodesChange<Node<GraphData>>;
  onEdgesChange: OnEdgesChange;
  onEdgesDelete: (edges: Edge[]) => void;
  handleConnect: (connection: Connection) => void;
  addEdge: (conn: Connection) => void;
  setEdges: (edges: Edge[]) => void;
  isValidConnection: (connection: Edge | Connection) => boolean;

  updateNode: (id: string, partial: Partial<GraphData>) => void;
  createNode: (type: GraphNodeType) => void;
  setNodeValue: <T extends IOType>(
    id: string,
    port: string,
    direction: PortDirection,
    value: Partial<Port<T>>,
    propagate?: boolean
  ) => void;
  getNodeValue<T extends IOType>(
    id: string,
    port: string,
    direction: PortDirection
  ): { type: T; connected: boolean; value: IOTypeMap[T] } | undefined;
  removeInvalidEdges: (id: string) => void;
  propagateValueToDownstream: <T extends IOType>(
    sourceId: string,
    sourcePort: string,
    value: Partial<Port<T>>
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
        graph.globals.addVariable(
          "initial_prompt",
          "string",
          "Why is the sky blue?"
        );
        graph.globals.addVariable("llm_model", "string", "gemma3:4b");
        graph.globals.addVariable("test123", "number", 10);
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
    const node = createInitialNode(type, id, { x: 100, y: 100 });
    set({ nodes: [...get().nodes, node] });
  },

  updateNode(id, partial) {
    set({
      nodes: get().nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, ...partial } } : node
      ),
    });
  },

  setNodeValue(id, port, direction, value, propagate = true) {
    const node = get().nodes.find((n) => n.id === id);
    if (!node) return;
    const data = node.data as Data;
    if (!data[direction]) return;

    get().updateNode(id, {
      [direction]: {
        ...data[direction],
        [port]: {
          ...data[direction][port],
          ...value,
        },
      },
    });

    if (propagate) {
      get().removeInvalidEdges(id);
      get().propagateValueToDownstream(id, port, value);
    }
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
      const value = source.data.sources?.[data.sourceHandle].value;
      state.setNodeValue(target.id, data.targetHandle, "targets", {
        connected: true,
        value,
      });
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
        state.setNodeValue(target.id, targetHandle, "targets", {
          connected: false,
          value: "",
        });
      }
    }

    set((s) => ({
      edges: s.edges.filter((e) => !deleted.some((d) => d.id === e.id)),
    }));
  },

  propagateValueToDownstream(
    sourceId: string,
    sourcePort: string,
    value: Partial<Port<IOType>>
  ) {
    const state = get();
    const edges = state.edges.filter(
      (e) => e.source === sourceId && e.sourceHandle === sourcePort
    );

    for (const edge of edges) {
      const target = state.nodes.find((n) => n.id === edge.target);
      if (!target || !edge.targetHandle) continue;

      const targetPort = edge.targetHandle;
      state.setNodeValue(target.id, targetPort, "targets", {
        ...value,
      });
    }
  },

  removeInvalidEdges(id) {
    const { nodes, edges, setEdges, setNodeValue } = useGraphStore.getState();

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
        setNodeValue(
          sourceNode.id,
          edge.sourceHandle,
          "sources",
          {
            connected: false,
          },
          false
        );
      }
      if (targetNode && targetPort && edge.targetHandle) {
        setNodeValue(
          targetNode.id,
          edge.targetHandle,
          "targets",
          {
            connected: false,
            value:
              targetPort.type === "string"
                ? ""
                : targetPort.type === "number"
                ? 0
                : false,
          },
          false
        );
      }
    }

    setEdges(nextEdges);
  },

  compileGraph(id) {
    const { nodes, edges, graphs } = get();
    const graph = graphs[id].graph;
    graph.clear();

    for (const node of nodes) {
      addNodeFromReactFlow(node, graph);
    }

    for (const edge of edges) {
      graph.addEdge({
        fromNode: edge.source,
        toNode: edge.target,
        fromPort: edge.sourceHandle ?? "output",
        toPort: edge.targetHandle ?? "input",
      });
    }

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
      state.graphs[
        state.activeGraphId ?? "default"
      ].graph.globals.getVariables()
    );
  },
}));
