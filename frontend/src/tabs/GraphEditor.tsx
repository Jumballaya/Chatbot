import { Background, ReactFlow } from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import { GraphState, useGraphStore } from "../state/graphStore";
import { shallow } from "zustand/shallow";
import StringNodeComponent from "../components/graph/StringNodeComponent";
import NumberNodeComponent from "../components/graph/NumberNodeComponent";
import { useUIStore } from "../state/uiStore";
import PromptNodeComponent from "../components/graph/PromptNodeComponent";
import GlobalVariableNodeComponent from "../components/graph/GlobalVariableNodeComponent";
import LLMNodeComponent from "../components/graph/LLMNodeComponent";
import OutputNodeComponent from "../components/graph/OutputNodeComponent";

const graphSelector = (store: GraphState) => ({
  nodes: store.nodes,
  edges: store.edges,
  onNodesChange: store.onNodesChange,
  onEdgesChange: store.onEdgesChange,
  addEdge: store.addEdge,
});

const nodeTypes = {
  string: StringNodeComponent,
  number: NumberNodeComponent,
  prompt: PromptNodeComponent,
  variable: GlobalVariableNodeComponent,
  llm: LLMNodeComponent,
  out: OutputNodeComponent,
};

export function GraphEditorTab() {
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
      onConnect={graphStore.addEdge}
    >
      <Background />
    </ReactFlow>
  );
}
