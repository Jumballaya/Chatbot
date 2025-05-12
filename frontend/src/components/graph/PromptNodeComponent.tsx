import { Handle, Position } from "@xyflow/react";
import BaseNodeComponent from "./BaseNodeComponent";
import { useState } from "react";
import StringInput from "./inputs/StringInput";

export default function PromptNodeComponent() {
  const [val, setVal] = useState("");

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
          onChange={(e) => setVal(e.target.value)}
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
