import { Handle, Position } from "@xyflow/react";
import BaseNodeComponent from "./BaseNodeComponent";
import { useState } from "react";
import StringInput from "./inputs/StringInput";

export default function OutputNodeComponent() {
  const [val, setVal] = useState("");

  return (
    <BaseNodeComponent title="Output">
      <div className="relative px-1 py-0.5 space-y-0.5">
        <Handle id="input" type="target" position={Position.Left} />
        <StringInput
          label="output"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          disabled={true}
        />
      </div>
    </BaseNodeComponent>
  );
}
