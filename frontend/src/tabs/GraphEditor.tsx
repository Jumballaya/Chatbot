import { Background, Panel, ReactFlow } from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import { GraphState, useGraphStore } from "../state/graphStore";
import { shallow } from "zustand/shallow";
import { useUIStore } from "../state/uiStore";
import GraphToolBar from "../components/graph/GraphToolBar";
import GraphNodeComponent from "../components/graph/nodes/GraphNode";

const graphSelector = (store: GraphState) => ({
  nodes: store.nodes,
  edges: store.edges,
  onNodesChange: store.onNodesChange,
  onEdgesChange: store.onEdgesChange,
  handleConnect: store.handleConnect,
  onEdgesDelete: store.onEdgesDelete,
  isValidConnection: store.isValidConnection,
});

const nodeTypes = {
  string: GraphNodeComponent,
  number: GraphNodeComponent,
  boolean: GraphNodeComponent,
  llm: GraphNodeComponent,
  out: GraphNodeComponent,
};

export default function GraphEditorTab() {
  const graphStore = useGraphStore(graphSelector, shallow);
  const darkMode = useUIStore((s) => s.darkMode);

  return (
    <ReactFlow
      colorMode={darkMode ? "dark" : "light"}
      nodeTypes={nodeTypes}
      nodes={graphStore.nodes}
      edges={graphStore.edges}
      onNodesChange={graphStore.onNodesChange}
      onEdgesChange={graphStore.onEdgesChange}
      onEdgesDelete={graphStore.onEdgesDelete}
      onConnect={graphStore.handleConnect}
      isValidConnection={graphStore.isValidConnection}
    >
      <Panel position="top-right">
        <GraphToolBar />
      </Panel>
      <Background />
    </ReactFlow>
  );
}
