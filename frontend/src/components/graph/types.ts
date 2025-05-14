import type { ReactNode } from "react";
import type { IOType, Port } from "../../graph/types";

export type BaseNodeComponentProps = {
  title: string;
  children: ReactNode;
};

export type GraphData = {
  sources?: Record<string, Port<IOType>>;
  targets?: Record<string, Port<IOType>>;
};

export type BooleanNodeProps = {
  type: "boolean";
  id: string;
  data: {
    sources: { boolean: Port<"boolean"> };
  };
};

export type StringNodeProps = {
  type: "string";
  id: string;
  data: {
    sources: { string: Port<"string"> };
  };
};

export type NumberNodeProps = {
  type: "number";
  id: string;
  data: {
    sources: { number: Port<"number"> };
  };
};

export type VariableNodeProps = {
  type: "variable";
  id: string;
  data: {
    sources: { output: Port<"any"> };
  };
};

export type LLMNodeProps = {
  type: "llm";
  id: string;
  data: {
    sources: { llm_output: Port<"string"> };
    targets: {
      prompt: Port<"string">;
      model: Port<"string">;
      system: Port<"string">;
      stream: Port<"boolean">;
    };
  };
};

export type OutputNodeProps = {
  type: "out";
  id: string;
  data: {
    targets: { input: Port<"string"> };
  };
};

export type PromptNodeProps = {
  type: "prompt";
  id: string;
  data: {
    targets: { input: Port<"string"> };
    sources: { prompt: Port<"string"> };
  };
};
