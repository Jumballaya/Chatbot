import { XYPosition } from "@xyflow/react";
import {
  BooleanNodeProps,
  LLMNodeProps,
  NumberNodeProps,
  OutputNodeProps,
  PromptNodeProps,
  StringNodeProps,
  VariableNodeProps,
} from "../components/graph/types";
import { GraphNodeType } from "./types";

type WithPosition<T> = T & { position: XYPosition };

type GraphNode =
  | BooleanNodeProps
  | StringNodeProps
  | NumberNodeProps
  | VariableNodeProps
  | PromptNodeProps
  | LLMNodeProps
  | OutputNodeProps;

type GenerateFn = (id: string, position: XYPosition) => WithPosition<GraphNode>;

const map: Record<GraphNode["type"], GenerateFn> = {
  boolean: createBooleanNode,
  string: createStringNode,
  number: createNumberNode,
  variable: createVariableNode,
  prompt: createPromptNode,
  llm: createLLMNode,
  out: createOutputNode,
};

export function createInitialNode(
  type: GraphNodeType,
  id: string,
  position: XYPosition
) {
  if (type === "output") {
    return map["out"](id, position);
  }
  return map[type as GraphNode["type"]](id, position);
}

export function createBooleanNode(
  id: string,
  position: XYPosition
): WithPosition<BooleanNodeProps> {
  return {
    type: "boolean",
    id,
    data: {
      sources: {
        boolean: {
          connected: false,
          type: "boolean",
          value: false,
          controlled: true,
        },
      },
    },
    position,
  };
}

export function createStringNode(
  id: string,
  position: XYPosition
): WithPosition<StringNodeProps> {
  return {
    type: "string",
    id,
    data: {
      sources: {
        string: {
          connected: false,
          type: "string",
          value: "",
          controlled: true,
        },
      },
    },
    position,
  };
}

export function createNumberNode(
  id: string,
  position: XYPosition
): WithPosition<NumberNodeProps> {
  return {
    type: "number",
    id,
    data: {
      sources: {
        number: {
          connected: false,
          type: "number",
          value: 0,
          controlled: true,
        },
      },
    },
    position,
  };
}

export function createVariableNode(
  id: string,
  position: XYPosition
): WithPosition<VariableNodeProps> {
  return {
    type: "variable",
    id,
    data: {
      sources: {
        output: {
          connected: false,
          type: "any",
          value: "",
          controlled: true,
        },
      },
    },
    position,
  };
}

export function createPromptNode(
  id: string,
  position: XYPosition
): WithPosition<PromptNodeProps> {
  return {
    type: "prompt",
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
    position,
  };
}

export function createLLMNode(
  id: string,
  position: XYPosition
): WithPosition<LLMNodeProps> {
  return {
    type: "llm",
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
        history: {
          connected: false,
          type: "boolean",
          value: true,
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
    position,
  };
}

export function createOutputNode(
  id: string,
  position: XYPosition
): WithPosition<OutputNodeProps> {
  return {
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
    position,
  };
}

export function getNodeTitle(type: string): string {
  switch (type) {
    case "string":
      return "String";
    case "boolean":
      return "Boolean";
    case "number":
      return "Number";
    case "variable":
      return "Variable";
    case "llm":
      return "LLM Node";
    case "out":
      return "Output";
  }
  return "";
}
