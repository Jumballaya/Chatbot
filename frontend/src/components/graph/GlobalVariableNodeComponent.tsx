import { Handle, Position } from "@xyflow/react";
import BaseNodeComponent from "./BaseNodeComponent";
import StringInput from "./inputs/StringInput";
import DropdownInput from "./inputs/DropdownInput";
import { useState } from "react";

const globals: Array<{ key: string; value: string }> = [
  {
    key: "llm_model",
    value: "llm_model",
  },
  {
    key: "initial_prompt",
    value: "initial_prompt",
  },
];

export default function GlobalVariableNodeComponent() {
  const [value, setValue] = useState("llm_model");

  return (
    <BaseNodeComponent title="Global Variable">
      <div className="relative px-1 py-0.5 space-y-0.5">
        <div className="flex flex-row flex-nowrap">
          <div className="flex-grow flex-1 flex items-center">
            <DropdownInput
              label=""
              value={value}
              options={globals}
              onChange={(e) => {
                setValue(e.target.value);
              }}
            />
          </div>
          <div className="flex-grow flex-1 flex items-center">
            <StringInput label="" value={"gemma3:4b"} disabled={true} />
          </div>
        </div>
        <Handle
          id="string"
          type="source"
          position={Position.Right}
          className="w-3 h-3 bg-red"
        />
      </div>
    </BaseNodeComponent>
  );
}
