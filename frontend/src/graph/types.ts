import { NodeContext } from "./NodeContext";

export type NodeId = string;
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
export type VariableType = "string" | "number" | "boolean";
export type VariableValue = string | number | boolean;

export interface VariableDef {
  id: string;
  name: string;
  type: VariableType;
  value: VariableValue;
}

export type Port<T extends IOType> = {
  connected: boolean;
  type: T;
  value: IOTypeMap[T];
};

export type IOType = "string" | "number" | "boolean" | "any";
export type IOTypeMap = {
  string: string;
  number: number;
  boolean: boolean;
  any: any;
};
export type InputPort = {
  type: IOType;
  required?: boolean;
  default?: VariableValue;
};
export type OutputPort = {
  type: IOType;
};

export type Data = Record<string, any>;

export type OnCompleteCB<O extends Data = Data> = (
  result: O,
  context: NodeContext
) => void | Promise<void>;

export interface GraphEdge {
  fromNode: NodeId;
  fromPort: string;
  toNode: NodeId;
  toPort: string;
  label?: string;
  condition?: ConditionalValue;
}

export enum NodeStatus {
  Pending = "pending",
  InProgress = "in_progress",
  Completed = "completed",
  Failed = "failed",
  Skipped = "skipped",
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
  global: Record<string, VariableValue>;
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
  target: VariableValue; // the target to compare against
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
  onComplete?: OnCompleteCB;
};

export type LLMNodeConfig = BaseNodeConfig & {
  type: "llm";
  stream?: boolean;
  model: string;
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
export type PromptNodeConfig = BaseNodeConfig & { type: "prompt" };
export type OutputNodeConfig = BaseNodeConfig & { type: "output" };
export type VariableNodeConfig = BaseNodeConfig & { type: "variable" };

export type NodeConfig =
  | StringNodeConfig
  | NumberNodeConfig
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
