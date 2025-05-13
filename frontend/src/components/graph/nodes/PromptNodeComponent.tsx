import { Handle, Position } from "@xyflow/react";
import BaseNodeComponent from "./BaseNodeComponent";
import { useEffect, useState } from "react";
import StringInput from "../inputs/StringInput";
import { GraphState, useGraphStore } from "../../../state/graphStore";

export type PromptNodeProps = {
  id: string;
  data: {
    input: string;
    prompt: string;
  };
};

const selector = (id: string) => (store: GraphState) => ({
  setPrompt: (prompt: string) => store.updateNode(id, { prompt }),
  seInput: (input: string) => store.updateNode(id, { input }),
});

export default function PromptNodeComponent(props: PromptNodeProps) {
  const [val, setVal] = useState(props.data.input ?? "");
  const node = useGraphStore(selector(props.id));

  const prompt = props.data.input;
  useEffect(() => {
    setVal(prompt);
  }, [prompt]);

  return (
    <BaseNodeComponent title="Prompt">
      <div className="relative px-1 py-0.5 space-y-0.5">
        <Handle
          id="input"
          type="target"
          position={Position.Left}
          className="w-3 h-3 bg-red"
        />
        <StringInput
          label="prompt"
          value={val}
          onChange={(e) => {
            setVal(e.target.value);
            node.setPrompt(e.target.value);
          }}
        />
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
