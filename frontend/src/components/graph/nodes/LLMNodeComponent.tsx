import { Position } from "@xyflow/react";
import BaseNodeComponent from "./BaseNodeComponent";
import StringInput from "../inputs/StringInput";
import DropdownInput from "../inputs/DropdownInput";
import { GraphState, useGraphStore } from "../../../state/graphStore";
import { shallow } from "zustand/shallow";
import ControlledInput from "../inputs/ControlledInput";
import TypedHandle from "../TypedHandle";
import { LLMNodeProps } from "../types";

//
//
//  @TODO: Get the actual list of models from
//         the chat store (move non-chat stuff to its on store)
//
//

const selector = (id: string) => (store: GraphState) => ({
  setPrompt: (prompt: string) =>
    store.setNodeValue(id, "prompt", "targets", { value: prompt }),
  setModel: (model: string) =>
    store.setNodeValue(id, "model", "targets", { value: model }),
  setSystem: (system: string) =>
    store.setNodeValue(id, "system", "targets", { value: system }),
  setStream: (stream: boolean) =>
    store.setNodeValue(id, "stream", "targets", { value: stream }),

  promptValue: store.getNodeValue(id, "prompt", "targets")?.value ?? "",
  promptConnected:
    store.getNodeValue(id, "prompt", "targets")?.connected ?? false,

  modelValue: store.getNodeValue(id, "model", "targets")?.value ?? "",
  modelConnected:
    store.getNodeValue(id, "model", "targets")?.connected ?? false,

  systemValue: store.getNodeValue(id, "system", "targets")?.value ?? "",
  systemConnected:
    store.getNodeValue(id, "system", "targets")?.connected ?? false,

  streamValue: store.getNodeValue(id, "stream", "targets")?.value ?? false,
  streamConnected:
    store.getNodeValue(id, "stream", "targets")?.connected ?? false,
});

export default function LLMNodeComponent(props: LLMNodeProps) {
  const {
    setPrompt,
    setModel,
    setSystem,
    setStream,
    promptValue,
    promptConnected,
    modelValue,
    modelConnected,
    systemValue,
    systemConnected,
    streamValue,
    streamConnected,
  } = useGraphStore(selector(props.id), shallow);

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
          value={modelValue as string}
          onChange={(e) => setModel(e.target.value)}
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
          <ControlledInput name="prompt" value={promptValue} />
        ) : (
          <StringInput
            label="prompt"
            value={promptValue as string}
            onChange={(e) => setPrompt(e.target.value)}
          />
        )}
      </div>
      <div className="relative px-1 py-0.5 space-y-0.5">
        <TypedHandle
          id="system"
          type="target"
          position={Position.Left}
          dataType="string"
        />
        {systemConnected ? (
          <ControlledInput name="system" value={systemValue} />
        ) : (
          <StringInput
            label="system"
            value={systemValue as string}
            onChange={(e) => setSystem(e.target.value)}
          />
        )}
      </div>
      <div className="relative px-1 py-0.5 space-y-0.5">
        <TypedHandle
          id="stream"
          type="target"
          position={Position.Left}
          dataType="boolean"
        />
        {streamConnected ? (
          <ControlledInput name="stream?" value={streamValue.toString()} />
        ) : (
          <StringInput
            label="stream?"
            value={(streamValue as boolean).toString()}
            onChange={(e) =>
              setStream(e.target.value === "true" ? true : false)
            }
          />
        )}
      </div>
    </BaseNodeComponent>
  );
}
