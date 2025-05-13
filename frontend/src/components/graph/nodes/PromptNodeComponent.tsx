import { Handle, Position } from "@xyflow/react";
import BaseNodeComponent from "./BaseNodeComponent";
import { useEffect, useState } from "react";
import StringInput from "../inputs/StringInput";
import { GraphState, useGraphStore } from "../../../state/graphStore";
import ControlledInput from "../inputs/ControlledInput";
import { Port } from "../../../graph/types";

export type PromptNodeProps = {
  id: string;
  data: {
    sources: { input: Port<"string"> };
    targets: { prompt: Port<"string"> };
  };
};

const selector = (id: string) => (store: GraphState) => ({
  setInput: (input: string) => {
    const node = store.nodes.find((v) => v.id === id);
    if (!node) return;
    store.updateNode(id, {
      ...node.data,
      sources: {
        ...(node.data.sources as object),
        input: {
          ...((node.data.sources as any).input as object),
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
      targets: {
        ...(node.data.targets as object),
        prompt: {
          ...((node.data.targets as any).prompt as object),
          value: prompt,
        },
      },
    });
  },
});

export default function PromptNodeComponent(props: PromptNodeProps) {
  const [val, setVal] = useState(props.data.sources.input.value ?? "");
  const node = useGraphStore(selector(props.id));

  const prompt = props.data.sources.input.value;
  const promptConnected = props.data.sources.input.connected;
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
