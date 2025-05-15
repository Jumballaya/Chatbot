import { Node } from "@xyflow/react";
import { GraphData } from "../components/graph/types";
import { ExecutionGraph } from "./ExecutionGraph";
import { StringNode } from "./nodes/StringNode";

export function addNodeFromReactFlow(
  node: Node<GraphData>,
  graph: ExecutionGraph
) {
  switch (node.type) {
    case "string": {
      graph.addNode({
        name: node.id,
        type: "string",
      });
      const found = graph.nodes.get(node.id) as StringNode;
      if (found) {
        found.string = node.data.sources!.string.value;
      }
      break;
    }
    case "prompt": {
      graph.addNode({
        name: node.id,
        type: "prompt",
      });
      break;
    }
    case "out": {
      graph.addNode({
        name: node.id,
        type: "output",
      });
      break;
    }
    case "llm": {
      graph.addNode({
        name: node.id,
        type: "llm",
        model: node.data.targets!.model.value,
      });
      break;
    }
  }
}
