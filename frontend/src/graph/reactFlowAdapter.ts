import { Node } from "@xyflow/react";
import { GraphData } from "../components/graph/types";
import { ExecutionGraph } from "./ExecutionGraph";
import { StringNode } from "./nodes/StringNode";
import { BooleanNode } from "./nodes/BooleanNode";
import { NumberNode } from "./nodes/NumberNode";

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
    case "boolean": {
      graph.addNode({
        name: node.id,
        type: "boolean",
      });
      const found = graph.nodes.get(node.id) as BooleanNode;
      if (found) {
        found.boolean = node.data.sources!.boolean.value;
      }
      break;
    }
    case "number": {
      graph.addNode({
        name: node.id,
        type: "number",
      });
      const found = graph.nodes.get(node.id) as NumberNode;
      if (found) {
        found.number = node.data.sources!.number.value;
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
      // const inputModel = node.data.targets!.model.value;
      graph.addNode({
        name: node.id,
        type: "llm",
        model: node.data.targets!.model.value,
        system: node.data.targets!.system.value,
        stream: node.data.targets!.stream.value,
        history: node.data.targets!.history.value,
      });
      break;
    }
  }
}
