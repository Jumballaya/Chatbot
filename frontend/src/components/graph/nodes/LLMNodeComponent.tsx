import { Handle, Position } from "@xyflow/react";
import BaseNodeComponent from "./BaseNodeComponent";
import { useEffect, useState } from "react";
import StringInput from "../inputs/StringInput";
import DropdownInput from "../inputs/DropdownInput";
import { GraphState, useGraphStore } from "../../../state/graphStore";
import { shallow } from "zustand/shallow";
import ControlledInput from "../inputs/ControlledInput";
import { Port } from "../../../graph/types";

export type LLMNodeProps = {
  id: string;
  data: {
    sources: {
      prompt: Port<"string">;
      model: Port<"string">;
      system: Port<"string">;
      stream: Port<"boolean">;
    };
    targets: { llm_output: Port<"string"> };
  };
};

const selector = (id: string) => (store: GraphState) => ({
  setPrompt: (prompt: string) => {
    const node = store.nodes.find((v) => v.id === id);
    if (!node) return;
    store.updateNode(id, {
      ...node.data,
      sources: {
        ...(node.data.sources as object),
        prompt: {
          ...((node.data.sources as any).prompt as object),
          value: prompt,
        },
      },
    });
  },

  setModel: (model: string) => {
    const node = store.nodes.find((v) => v.id === id);
    if (!node) return;
    store.updateNode(id, {
      ...node.data,
      sources: {
        ...(node.data.sources as object),
        model: {
          ...((node.data.sources as any).model as object),
          value: model,
        },
      },
    });
  },

  setStream: (stream: boolean) => {
    const node = store.nodes.find((v) => v.id === id);
    if (!node) return;
    store.updateNode(id, {
      ...node.data,
      sources: {
        ...(node.data.sources as object),
        stream: {
          ...((node.data.sources as any).stream as object),
          value: stream,
        },
      },
    });
  },

  setSystem: (system: string) => {
    const node = store.nodes.find((v) => v.id === id);
    if (!node) return;
    store.updateNode(id, {
      ...node.data,
      sources: {
        ...(node.data.sources as object),
        system: {
          ...((node.data.sources as any).system as object),
          value: system,
        },
      },
    });
  },

  setOutput: (llm_output: string) => {
    const node = store.nodes.find((v) => v.id === id);
    if (!node) return;
    store.updateNode(id, {
      ...node.data,
      targets: {
        ...(node.data.targets as object),
        llm_output: {
          ...((node.data.targets as any).llm_output as object),
          value: llm_output,
        },
      },
    });
  },
});

export default function LLMNodeComponent(props: LLMNodeProps) {
  const [promptVal, setPromptVal] = useState(props.data.sources.prompt.value);
  const [modelVal, setModelVal] = useState(props.data.sources.model.value);

  const node = useGraphStore(selector(props.id), shallow);

  const prompt = props.data.sources.prompt.value;
  const promptConnected = props.data.sources.prompt.connected;
  const model = props.data.sources.model.value;
  const modelConnected = props.data.sources.model.connected;

  useEffect(() => {
    setPromptVal(prompt);
    setModelVal(model);
    if (promptConnected) {
      node.setPrompt(prompt);
    }
    if (modelConnected) {
      node.setModel(model);
    }
  }, [prompt, promptConnected, model, modelConnected]);

  return (
    <BaseNodeComponent title="LLM">
      <div className="relative px-1 py-0.5 space-y-0.5">
        <Handle id="llm_output" type="source" position={Position.Right} />
        <span className="text-sm text-zinc-600 dark:text-zinc-400 text-right w-full block pr-2 py-1">
          LLM Output
        </span>
      </div>
      <div className="relative px-1 py-0.5 space-y-0.5">
        <Handle id="model" type="target" position={Position.Left} />
        <DropdownInput
          label="model"
          value={modelVal}
          onChange={(e) => setModelVal(e.target.value)}
          options={[{ key: "gemma3:4b", value: "gemma3:4b" }]}
          disabled={modelConnected}
        />
      </div>
      <div className="relative px-1 py-0.5 space-y-0.5">
        <Handle id="prompt" type="target" position={Position.Left} />
        {promptConnected ? (
          <ControlledInput name="prompt" value={prompt} />
        ) : (
          <StringInput
            label="prompt"
            value={promptVal}
            onChange={(e) => setPromptVal(e.target.value)}
          />
        )}
      </div>
    </BaseNodeComponent>
  );
}
