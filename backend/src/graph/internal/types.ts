import { NodeContext } from "./NodeContext";

export type NodeId = string;
export type PortDirection = "targets" | "sources";
export type ConditionalValue = "true" | "false" | string;
export type RetryPolicyValue = "never" | "on_failure" | "always";
export type GraphNodeType =
  | "prompt"
  | "llm"
  | "output"
  | "if"
  | "tool-call"
  | "tool"
  | "string"
  | "number"
  | "boolean"
  | "variable";
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
export type IOType = "string" | "number" | "boolean" | "any";
export type IOTypeMap = {
  string: string;
  number: number;
  boolean: boolean;
  any: any;
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
};

export type InputPort = {
  type: IOType;
  required?: boolean;
  default?: IOTypeMap[IOType];
};
export type OutputPort = {
  type: IOType;
};

export type Data = Record<string, any>;

export interface GraphEdge {
  fromNode: NodeId;
  fromPort: string;
  toNode: NodeId;
  toPort: string;
  label?: string;
  condition?: ConditionalValue;
}

export enum NodeStatus {
  StandBy = "standby",
  Pending = "pending",
  Ready = "ready",
  InProgress = "in_progress",
  Completed = "completed",
  Failed = "failed",
}

export interface RetryConfig {
  policy: RetryPolicyValue;
  max?: number;
  delayMs?: number;
}

export interface ChatEntry {
  role: "user" | "assistant" | "tool" | "system";
  content: string;
}

export interface GraphContext {
  chatHistory: ChatEntry[];
  global: Record<string, IOTypeMap[IOType]>;
}

export type ExecutionUpdate<O extends Data = Data> =
  | {
      nodeId: NodeId;
      status: Exclude<NodeStatus, NodeStatus.Completed>;
      partial?: true;
      final?: false;
      output?: O;
    }
  | {
      nodeId: NodeId;
      status: NodeStatus.Completed;
      final: true; // discriminator
      output: O; // **always present**
    }
  | {
      nodeId: NodeId;
      status: NodeStatus.Failed;
      error: string;
    };

// Complex Inputs/Outputs

export interface IfInputs {
  selector: string; // dot-path to the output to compare
  op: ComparisonOp;
  target: IOTypeMap[IOType]; // the target to compare against
  ignoreCase?: boolean;
}

export interface IfOutputs {
  result: boolean;
}

// Graph Public API
type BaseNodeConfig = {
  type: GraphNodeType;
  name: string;
  retry?: RetryConfig;
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

// ToolNode receives args and produces a result
export interface ToolNodeInputs {
  args: Data;
}

export interface ToolNodeOutputs {
  result: unknown;
}

// Ollama
export type LLMFormat = unknown;
