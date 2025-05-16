import { Position } from "@xyflow/react";
import BaseNodeComponent from "./BaseNodeComponent";
import StringInput from "../inputs/StringInput";
import DropdownInput from "../inputs/DropdownInput";
import { GraphState, useGraphStore } from "../../../state/graphStore";
import { shallow } from "zustand/shallow";
import ControlledInput from "../inputs/ControlledInput";
import TypedHandle from "../TypedHandle";
import { LLMNodeProps } from "../types";
import NodeRow from "../NodeRow";
import InputLabel from "../inputs/InputLabel";
import BooleanInput from "../inputs/BooleanInput";

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
  setHistory: (history: boolean) =>
    store.setNodeValue(id, "history", "targets", { value: history }),

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

  historyValue: store.getNodeValue(id, "history", "targets")?.value ?? true,
  historyConnected:
    store.getNodeValue(id, "history", "targets")?.connected ?? true,
});

export default function LLMNodeComponent(props: LLMNodeProps) {
  const {
    setPrompt,
    setModel,
    setSystem,
    setStream,
    setHistory,
    promptValue,
    promptConnected,
    modelValue,
    modelConnected,
    systemValue,
    systemConnected,
    streamValue,
    streamConnected,
    historyValue,
    historyConnected,
  } = useGraphStore(selector(props.id), shallow);

  return (
    <BaseNodeComponent title="LLM">
      <NodeRow columns={1}>
        <TypedHandle
          id="llm_output"
          type="source"
          position={Position.Right}
          dataType="string"
        />
        <InputLabel label="LLM Output" position="end" maxWidth={32} />
      </NodeRow>

      <NodeRow>
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
          placeholder="Select your LLM Model"
          options={[{ key: "gemma3:4b", value: "gemma3:4b" }]}
          disabled={modelConnected}
        />
      </NodeRow>

      <NodeRow>
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
      </NodeRow>

      <NodeRow>
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
      </NodeRow>

      <NodeRow>
        <TypedHandle
          id="stream"
          type="target"
          position={Position.Left}
          dataType="boolean"
        />
        {streamConnected ? (
          <BooleanInput
            label="stream?"
            value={streamValue}
            size="sm"
            disabled={true}
          />
        ) : (
          <BooleanInput
            label="stream?"
            value={streamValue}
            size="sm"
            onChange={(v) => setStream(v)}
          />
        )}
      </NodeRow>

      <NodeRow>
        <TypedHandle
          id="stream"
          type="target"
          position={Position.Left}
          dataType="boolean"
        />
        {historyConnected ? (
          <BooleanInput
            label="stream?"
            value={historyValue}
            size="sm"
            disabled={true}
          />
        ) : (
          <BooleanInput
            label="history?"
            value={historyValue}
            size="sm"
            onChange={(v) => setHistory(v)}
          />
        )}
      </NodeRow>
    </BaseNodeComponent>
  );
}
