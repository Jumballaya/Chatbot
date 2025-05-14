import { Position } from "@xyflow/react";
import BaseNodeComponent from "./BaseNodeComponent";
import StringInput from "../inputs/StringInput";
import { GraphState, useGraphStore } from "../../../state/graphStore";
import ControlledInput from "../inputs/ControlledInput";
import TypedHandle from "../TypedHandle";
import { shallow } from "zustand/shallow";
import usePropagateInputToOutput from "../../../hooks/usePropagateInputToOutput";
import { PromptNodeProps } from "../types";
import { VariableValue } from "../../../graph/types";

const selector = (id: string) => (store: GraphState) => ({
  setPrompt: (prompt: VariableValue) =>
    store.setNodeValue(id, "prompt", "sources", { value: prompt }),
  promptValue:
    store.getNodeValue<"string">(id, "prompt", "sources")?.value ?? "",

  setInput: (input: string) =>
    store.setNodeValue<"string">(id, "input", "targets", { value: input }),
  inputValue: store.getNodeValue<"string">(id, "input", "targets")?.value ?? "",
  inputConnected:
    store.getNodeValue(id, "input", "targets")?.connected ?? false,
});

export default function PromptNodeComponent(props: PromptNodeProps) {
  const { setPrompt, promptValue, inputValue, inputConnected, setInput } =
    useGraphStore(selector(props.id), shallow);
  usePropagateInputToOutput(inputValue, promptValue, setPrompt);

  return (
    <BaseNodeComponent title="Prompt">
      <div className="relative px-1 py-0.5 space-y-0.5">
        <TypedHandle
          id="input"
          type="target"
          position={Position.Left}
          dataType="string"
        />
        {inputConnected ? (
          <ControlledInput name="prompt" value={promptValue} />
        ) : (
          <StringInput
            label="prompt"
            value={inputValue as string}
            onChange={(e) => setInput(e.target.value)}
          />
        )}

        <TypedHandle
          id="prompt"
          type="source"
          position={Position.Right}
          dataType="string"
        />
      </div>
    </BaseNodeComponent>
  );
}
