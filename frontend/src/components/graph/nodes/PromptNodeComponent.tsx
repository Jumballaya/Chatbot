import { Handle, Position } from "@xyflow/react";
import BaseNodeComponent from "./BaseNodeComponent";
import { useEffect, useState } from "react";
import StringInput from "../inputs/StringInput";
import { GraphState, useGraphStore } from "../../../state/graphStore";
import ControlledInput from "../inputs/ControlledInput";
import { Data, Port } from "../../../graph/types";

export type PromptNodeProps = {
  id: string;
  data: {
    targets: { input: Port<"string"> };
    sources: { prompt: Port<"string"> };
  };
};

const selector = (id: string) => (store: GraphState) => ({
  setInput: (input: string) => {
    const node = store.nodes.find((v) => v.id === id);
    if (!node) return;
    store.updateNode(id, {
      ...node.data,
      targets: {
        ...(node.data.targets as object),
        input: {
          ...(node.data.targets as Data).input,
          value: input,
        },
      },
    });
  },

  setPrompt: (prompt: string) => {
    const node = store.nodes.find((v) => v.id === id);
    if (!node) return;
    store.updateNode(id, {
      ...node.data,
      sources: {
        ...(node.data.sources as object),
        prompt: {
          ...(node.data.sources as Data).prompt,
          value: prompt,
        },
      },
    });
    store.propagateValueToDownstream(id, "prompt", prompt);
  },
});

export default function PromptNodeComponent(props: PromptNodeProps) {
  const [val, setVal] = useState(props.data.targets.input.value ?? "");
  const node = useGraphStore(selector(props.id));

  const prompt = props.data.targets.input.value;
  const promptConnected = props.data.targets.input.connected;
  useEffect(() => {
    setVal(prompt);
    if (promptConnected) {
      node.setPrompt(prompt);
    }
  }, [prompt, promptConnected]);

  return (
    <BaseNodeComponent title="Prompt">
      <div className="relative px-1 py-0.5 space-y-0.5">
        <Handle
          id="input"
          type="target"
          position={Position.Left}
          className="w-3 h-3 bg-red"
        />
        {promptConnected ? (
          <ControlledInput name="prompt" value={prompt} />
        ) : (
          <StringInput
            label="prompt"
            value={val}
            onChange={(e) => {
              setVal(e.target.value);
              node.setPrompt(e.target.value);
            }}
          />
        )}

        <Handle
          id="prompt"
          type="source"
          position={Position.Right}
          className="w-3 h-3 bg-red"
        />
      </div>
    </BaseNodeComponent>
  );
}
