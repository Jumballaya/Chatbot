export type NodeId = string;
export type PortDirection = "targets" | "sources";
export type GraphNodeType = "llm" | "output" | "string" | "number" | "boolean";

export type IOType = "string" | "number" | "boolean";
export type IOTypeMap = {
  string: string;
  number: number;
  boolean: boolean;
};
export interface VariableDef {
  id: string;
  name: string;
  type: IOType;
  value: IOTypeMap[IOType];
}

export type Port<T extends IOType> = {
  connected: boolean;
  type: T;
  value: IOTypeMap[T];
  controlled?: boolean; // can you control the value with an input
};

export type Data = Record<string, unknown>;

export type NodeStatus =
  | "standby"
  | "pending"
  | "ready"
  | "in_progress"
  | "completed"
  | "failed";

export interface ChatEntry {
  role: "user" | "assistant" | "tool" | "system";
  content: string;
}

// Complex Inputs/Outputs

// Graph Public API
type BaseNodeConfig = {
  type: GraphNodeType;
  name: string;
};

export type LLMNodeConfig = BaseNodeConfig & {
  type: "llm";
  model: string;
  stream?: boolean;
  history?: boolean;
  system?: string;
  format?: LLMFormat;
  template?: (s: string) => string;
};

export type StringNodeConfig = BaseNodeConfig & { type: "string" };
export type NumberNodeConfig = BaseNodeConfig & { type: "number" };
export type BooleanNodeConfig = BaseNodeConfig & { type: "boolean" };
export type PromptNodeConfig = BaseNodeConfig & { type: "prompt" };
export type OutputNodeConfig = BaseNodeConfig & { type: "output" };
export type VariableNodeConfig = BaseNodeConfig & { type: "variable" };

export type NodeConfig =
  | StringNodeConfig
  | NumberNodeConfig
  | BooleanNodeConfig
  | PromptNodeConfig
  | LLMNodeConfig
  | IfNodeConfig
  | OutputNodeConfig
  | ToolCallNodeConfig
  | ToolNodeConfig
  | VariableNodeConfig;

// Extras ---
//
//    Leftover from first attempt
//
// ---------------
export interface Tool {
  type: "function";
  function: {
    name: string;
    description?: string;
    parameters: {
      type: "object";
      properties: Record<string, { type: string }>;
      required?: string[];
    };
  };
}

export interface ToolCallInputs {
  tools: Tool[];
}

export interface ToolCallOutputs {
  selectedTool?: string;
  toolArgs?: Data;
}

export type LLMFormat = unknown;

export type ConditionalValue = "true" | "false" | string;
export type ComparisonOp =
  | "eq" // number compare
  | "neq"
  | "lt"
  | "gt"
  | "lte"
  | "gte"
  | "contains" // string compare
  | "startsWith"
  | "endsWith";

export interface IfInputs {
  selector: string; // dot-path to the output to compare
  op: ComparisonOp;
  target: IOTypeMap[IOType]; // the target to compare against
  ignoreCase?: boolean;
}

export interface IfOutputs {
  result: boolean;
}

export type IfNodeConfig = BaseNodeConfig & {
  type: "if";
  statement: IfInputs;
};

export type ToolCallNodeConfig = BaseNodeConfig & {
  type: "tool-call";
  tools: Tool[];
  model: string;
};
export type ToolNodeConfig = BaseNodeConfig & {
  type: "tool";
  name: string;
  impl: (...params: unknown[]) => Promise<Data>;
};
