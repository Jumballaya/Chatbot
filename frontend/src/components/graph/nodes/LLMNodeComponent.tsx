import { Handle, Position } from "@xyflow/react";
import BaseNodeComponent from "./BaseNodeComponent";
import { useState } from "react";
import StringInput from "../inputs/StringInput";
import DropdownInput from "../inputs/DropdownInput";

export default function LLMNodeComponent() {
  const [val, setVal] = useState("");

  return (
    <BaseNodeComponent title="LLM">
      <div className="relative px-1 py-0.5 space-y-0.5">
        <Handle id="llm_output" type="source" position={Position.Right} />
        <span className="text-sm text-zinc-600 dark:text-zinc-400 text-right w-full block pr-2 py-1">
          LLM Output
        </span>
      </div>
      <div className="relative px-1 py-0.5 space-y-0.5">
        <Handle id="model_input_in" type="target" position={Position.Left} />
        <DropdownInput
          label="model"
          value={"gemma3:4b"}
          onChange={(e) => setVal(e.target.value)}
          options={[{ key: "gemma3:4b", value: "gemma3:4b" }]}
          disabled={true}
        />
      </div>
      <div className="relative px-1 py-0.5 space-y-0.5">
        <Handle id="prompt_in" type="target" position={Position.Left} />
        <StringInput
          label="prompt"
          value={val}
          onChange={(e) => setVal(e.target.value)}
        />
      </div>
    </BaseNodeComponent>
  );
}
