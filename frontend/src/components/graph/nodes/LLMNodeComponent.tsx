import { Position } from "@xyflow/react";
import BaseNodeComponent from "./BaseNodeComponent";
import { useEffect, useState } from "react";
import StringInput from "../inputs/StringInput";
import DropdownInput from "../inputs/DropdownInput";
import { GraphState, useGraphStore } from "../../../state/graphStore";
import { shallow } from "zustand/shallow";
import ControlledInput from "../inputs/ControlledInput";
import { Data, Port } from "../../../graph/types";
import TypedHandle from "../TypedHandle";

export type LLMNodeProps = {
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

const selector = (id: string) => (store: GraphState) => ({
  setPrompt: (prompt: string) => {
    const node = store.nodes.find((v) => v.id === id);
    if (!node) return;
    store.updateNode(id, {
      ...node.data,
      targets: {
        ...(node.data.targets as object),
        prompt: {
          ...(node.data.targets as Data).prompt,
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
      targets: {
        ...(node.data.targets as object),
        model: {
          ...(node.data.targets as Data).model,
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
      targets: {
        ...(node.data.targets as object),
        stream: {
          ...(node.data.targets as Data).stream,
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
      targets: {
        ...(node.data.targets as object),
        system: {
          ...(node.data.targets as Data).system,
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
      sources: {
        ...(node.data.sources as object),
        llm_output: {
          ...(node.data.sources as Data).llm_output,
          value: llm_output,
        },
      },
    });
    store.propagateValueToDownstream(id, "llm_output", llm_output);
  },
});

export default function LLMNodeComponent(props: LLMNodeProps) {
  const [promptVal, setPromptVal] = useState(props.data.targets.prompt.value);
  const [modelVal, setModelVal] = useState(props.data.targets.model.value);

  const node = useGraphStore(selector(props.id), shallow);

  const prompt = props.data.targets.prompt.value;
  const promptConnected = props.data.targets.prompt.connected;
  const model = props.data.targets.model.value;
  const modelConnected = props.data.targets.model.connected;

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
        <TypedHandle
          id="llm_output"
          type="source"
          position={Position.Right}
          dataType="string"
        />
        <span className="text-sm text-zinc-600 dark:text-zinc-400 text-right w-full block pr-2 py-1">
          LLM Output
        </span>
      </div>
      <div className="relative px-1 py-0.5 space-y-0.5">
        <TypedHandle
          id="model"
          type="target"
          position={Position.Left}
          dataType="string"
        />
        <DropdownInput
          label="model"
          value={modelVal}
          onChange={(e) => setModelVal(e.target.value)}
          options={[{ key: "gemma3:4b", value: "gemma3:4b" }]}
          disabled={modelConnected}
        />
      </div>
      <div className="relative px-1 py-0.5 space-y-0.5">
        <TypedHandle
          id="prompt"
          type="target"
          position={Position.Left}
          dataType="string"
        />
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
